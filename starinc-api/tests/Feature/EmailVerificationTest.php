<?php

namespace Tests\Feature;

use App\Mail\VerifyEmailMail;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

class EmailVerificationTest extends TestCase
{
    public function test_register_sends_verification_email(): void
    {
        Mail::fake();

        $this->postJson('/api/register', [
            'name'                  => 'Test User',
            'email'                 => 'verify@example.com',
            'password'              => 'password123',
            'password_confirmation' => 'password123',
        ])->assertStatus(201);

        Mail::assertSent(VerifyEmailMail::class, function ($mail) {
            return $mail->hasTo('verify@example.com');
        });

        $this->assertDatabaseHas('users', [
            'email'             => 'verify@example.com',
            'email_verified_at' => null,
        ]);
    }

    public function test_unverified_user_cannot_login(): void
    {
        $user = User::factory()->unverified()->create(['password' => 'password123']);

        $response = $this->postJson('/api/login', [
            'email'    => $user->email,
            'password' => 'password123',
        ]);

        $response->assertStatus(403)
                 ->assertJson(['email_unverified' => true]);
    }

    public function test_verified_user_can_login(): void
    {
        // UserFactory sets email_verified_at = now() by default
        $user = User::factory()->create(['password' => 'password123']);

        $response = $this->postJson('/api/login', [
            'email'    => $user->email,
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
                 ->assertJsonStructure(['token']);
    }

    public function test_magic_link_verifies_email(): void
    {
        $user = User::factory()->unverified()->create();

        $verifyUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            ['id' => $user->id, 'hash' => sha1($user->email)]
        );

        // Extract path + query from the full URL for the test request
        $parsedUrl = parse_url($verifyUrl);
        $path = $parsedUrl['path'] . '?' . $parsedUrl['query'];

        $response = $this->get($path);

        $response->assertRedirect();
        $this->assertStringContainsString('verified=1', $response->headers->get('Location'));

        $this->assertNotNull($user->fresh()->email_verified_at);
    }

    public function test_expired_magic_link_redirects_with_error(): void
    {
        $user = User::factory()->unverified()->create();

        // Generate a link that's already expired
        $expiredUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->subMinutes(1), // expired 1 minute ago
            ['id' => $user->id, 'hash' => sha1($user->email)]
        );

        $parsedUrl = parse_url($expiredUrl);
        $path = $parsedUrl['path'] . '?' . $parsedUrl['query'];

        $response = $this->get($path);

        $response->assertRedirect();
        $this->assertStringContainsString('error=expired', $response->headers->get('Location'));

        $this->assertNull($user->fresh()->email_verified_at);
    }

    public function test_resend_sends_new_email(): void
    {
        Mail::fake();

        $user = User::factory()->unverified()->create();

        $this->postJson('/api/email/resend', ['email' => $user->email])
             ->assertStatus(200);

        Mail::assertSent(VerifyEmailMail::class, function ($mail) use ($user) {
            return $mail->hasTo($user->email);
        });
    }

    public function test_resend_does_not_expose_unregistered_email(): void
    {
        Mail::fake();

        // Should still return 200 even for non-existent email (prevent enumeration)
        $this->postJson('/api/email/resend', ['email' => 'nobody@example.com'])
             ->assertStatus(200);

        Mail::assertNothingSent();
    }

    public function test_resend_skips_already_verified_user(): void
    {
        Mail::fake();

        $user = User::factory()->create(); // verified by default

        $this->postJson('/api/email/resend', ['email' => $user->email])
             ->assertStatus(200);

        Mail::assertNothingSent();
    }
}
