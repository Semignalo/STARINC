<?php

namespace Tests\Unit;

use App\Models\SystemSetting;
use App\Models\Tier;
use App\Models\User;
use App\Services\TierService;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class TierServiceTest extends TestCase
{
    private TierService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new TierService();
    }

    private function getTier(string $slug): Tier
    {
        return Tier::where('slug', $slug)->firstOrFail();
    }

    public function test_evaluate_upgrade_assigns_correct_tier(): void
    {
        $silverTier = $this->getTier('silver');
        $user = User::factory()
            ->withSpending(7000000)
            ->create();

        $this->service->evaluateUpgrade($user);

        $user->refresh();
        $this->assertEquals($silverTier->id, $user->tier_id);
    }

    public function test_evaluate_upgrade_selects_highest_qualifying_tier(): void
    {
        $goldTier = $this->getTier('gold');
        $user = User::factory()
            ->withSpending(12000000)
            ->create();

        $this->service->evaluateUpgrade($user);

        $user->refresh();
        $this->assertEquals($goldTier->id, $user->tier_id);
    }

    public function test_evaluate_upgrade_does_not_write_db_when_tier_already_correct(): void
    {
        $silverTier = $this->getTier('silver');
        $user = User::factory()
            ->withSpending(7000000)
            ->create();
        $user->update(['tier_id' => $silverTier->id]);

        DB::enableQueryLog();
        $this->service->evaluateUpgrade($user);
        $queries = DB::getQueryLog();
        DB::disableQueryLog();

        $updateQueries = array_filter($queries, fn($q) => str_starts_with(trim($q['query']), 'update'));
        $this->assertCount(0, $updateQueries);
    }

    public function test_evaluate_upgrade_skips_starcenter_role(): void
    {
        $user = User::factory()
            ->asStarcenter()
            ->withSpending(50000000)
            ->create();
        $originalTierId = $user->tier_id;

        $this->service->evaluateUpgrade($user);

        $user->refresh();
        $this->assertEquals($originalTierId, $user->tier_id);
    }

    public function test_evaluate_upgrade_skips_admin_role(): void
    {
        $user = User::factory()
            ->asAdmin()
            ->withSpending(50000000)
            ->create();
        $originalTierId = $user->tier_id;

        $this->service->evaluateUpgrade($user);

        $user->refresh();
        $this->assertEquals($originalTierId, $user->tier_id);
    }

    public function test_check_downgrades_returns_zero_when_no_inactive_users(): void
    {
        User::factory()->withLastTransaction(now()->subDays(5))->create();
        SystemSetting::setValue('tier_downgrade_days', '30');

        $result = $this->service->checkDowngrades();

        $this->assertEquals(0, $result);
    }

    public function test_check_downgrades_ignores_users_without_last_transaction(): void
    {
        $user = User::factory()->create();
        $user->update(['last_transaction_at' => null]);
        SystemSetting::setValue('tier_downgrade_days', '30');

        $result = $this->service->checkDowngrades();

        $this->assertEquals(0, $result);
    }

    public function test_check_downgrades_ignores_non_regular_users(): void
    {
        User::factory()
            ->asStarcenter()
            ->withLastTransaction(now()->subDays(90))
            ->create();
        SystemSetting::setValue('tier_downgrade_days', '30');

        $result = $this->service->checkDowngrades();

        $this->assertEquals(0, $result);
    }

    public function test_check_downgrades_drops_one_level_after_one_period(): void
    {
        $silverTier = $this->getTier('silver');
        $bronzeTier = $this->getTier('bronze');

        $user = User::factory()
            ->atTier($silverTier)
            ->withLastTransaction(now()->subDays(45))
            ->create();

        SystemSetting::setValue('tier_downgrade_days', '30');

        $result = $this->service->checkDowngrades();

        $user->refresh();
        $this->assertEquals(1, $result);
        $this->assertEquals($bronzeTier->id, $user->tier_id);
    }

    public function test_check_downgrades_drops_multiple_levels(): void
    {
        $goldTier = $this->getTier('gold');
        $bronzeTier = $this->getTier('bronze');

        $user = User::factory()
            ->atTier($goldTier)
            ->withLastTransaction(now()->subDays(75))
            ->create();

        SystemSetting::setValue('tier_downgrade_days', '30');

        $result = $this->service->checkDowngrades();

        $user->refresh();
        $this->assertEquals(1, $result);
        $this->assertEquals($bronzeTier->id, $user->tier_id);
    }

    public function test_check_downgrades_floors_at_bronze(): void
    {
        $silverTier = $this->getTier('silver');
        $bronzeTier = $this->getTier('bronze');

        $user = User::factory()
            ->atTier($silverTier)
            ->withLastTransaction(now()->subDays(200))
            ->create();

        SystemSetting::setValue('tier_downgrade_days', '30');

        $result = $this->service->checkDowngrades();

        $user->refresh();
        $this->assertEquals(1, $result);
        $this->assertEquals($bronzeTier->id, $user->tier_id);
    }

    public function test_check_downgrades_skips_user_already_at_bronze(): void
    {
        $bronzeTier = $this->getTier('bronze');

        User::factory()
            ->atTier($bronzeTier)
            ->withLastTransaction(now()->subDays(90))
            ->create();

        SystemSetting::setValue('tier_downgrade_days', '30');

        $result = $this->service->checkDowngrades();

        $this->assertEquals(0, $result);
    }

    public function test_check_downgrades_does_not_reset_last_transaction_at(): void
    {
        $silverTier = $this->getTier('silver');
        $originalDate = now()->subDays(45)->startOfSecond();

        $user = User::factory()
            ->atTier($silverTier)
            ->withLastTransaction($originalDate)
            ->create();

        SystemSetting::setValue('tier_downgrade_days', '30');

        $this->service->checkDowngrades();

        $user->refresh();
        $this->assertEquals(0, $user->last_transaction_at->diffInSeconds($originalDate));
    }

    public function test_check_downgrades_returns_correct_count(): void
    {
        $silverTier = $this->getTier('silver');

        User::factory()
            ->atTier($silverTier)
            ->withLastTransaction(now()->subDays(45))
            ->count(3)
            ->create();

        User::factory()
            ->atTier($silverTier)
            ->withLastTransaction(now()->subDays(5))
            ->count(1)
            ->create();

        SystemSetting::setValue('tier_downgrade_days', '30');

        $result = $this->service->checkDowngrades();

        $this->assertEquals(3, $result);
    }
}
