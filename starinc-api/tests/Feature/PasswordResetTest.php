<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        Mail::fake();
    }

    public function test_forgot_password_sends_email(): void
    {
        $user = User::factory()->create(['email' => 'test@example.com']);

        $response = $this->postJson('/api/forgot-password', [
            'email' => 'test@example.com',
        ]);

        $response->assertStatus(200)
                 ->assertJson([
                     'message' => 'Link reset password telah dikirim ke email Anda. Silakan cek email.',
                 ]);

        Mail::assertSent(\App\Mail\ResetPasswordMail::class);
    }

    public function test_forgot_password_invalid_email(): void
    {
        $response = $this->postJson('/api/forgot-password', [
            'email' => 'nonexistent@example.com',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors('email');
    }

    public function test_forgot_password_stores_token(): void
    {
        $user = User::factory()->create(['email' => 'test@example.com']);

        $response = $this->postJson('/api/forgot-password', [
            'email' => 'test@example.com',
        ]);

        $response->assertStatus(200);

        $resetRecord = DB::table('password_reset_tokens')
            ->where('email', 'test@example.com')
            ->first();

        $this->assertNotNull($resetRecord);
        $this->assertNotNull($resetRecord->token);
    }

    public function test_reset_password_dengan_valid_token(): void
    {
        $user = User::factory()->create([
            'email'    => 'test@example.com',
            'password' => 'oldpassword123',
        ]);

        // Generate reset token
        $this->postJson('/api/forgot-password', [
            'email' => 'test@example.com',
        ]);

        // Get the token from database
        $resetRecord = DB::table('password_reset_tokens')
            ->where('email', 'test@example.com')
            ->first();

        // Extract the plain token (we need to find it somehow)
        // For testing, we'll get all tokens and try each one
        $tokens = DB::table('password_reset_tokens')
            ->where('email', 'test@example.com')
            ->get();

        // In real test scenario, we'd intercept the email, but since we're using Mail::fake()
        // we need a different approach. Let's test with a generated token.
        $plainToken = \Illuminate\Support\Str::random(64);
        DB::table('password_reset_tokens')
            ->where('email', 'test@example.com')
            ->update(['token' => Hash::make($plainToken)]);

        $response = $this->postJson('/api/reset-password', [
            'email'                 => 'test@example.com',
            'token'                 => $plainToken,
            'password'              => 'newpassword12345',
            'password_confirmation' => 'newpassword12345',
        ]);

        $response->assertStatus(200)
                 ->assertJson([
                     'message' => 'Password berhasil direset. Silakan login dengan password baru Anda.',
                 ]);

        // Verify password changed
        $user->refresh();
        $this->assertTrue(Hash::check('newpassword12345', $user->password));

        // Verify token was deleted
        $resetRecord = DB::table('password_reset_tokens')
            ->where('email', 'test@example.com')
            ->first();

        $this->assertNull($resetRecord);
    }

    public function test_reset_password_invalid_token(): void
    {
        User::factory()->create(['email' => 'test@example.com']);

        $response = $this->postJson('/api/reset-password', [
            'email'                 => 'test@example.com',
            'token'                 => 'invalidtoken',
            'password'              => 'newpassword12345',
            'password_confirmation' => 'newpassword12345',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors('token');
    }

    public function test_reset_password_expired_token(): void
    {
        User::factory()->create(['email' => 'test@example.com']);

        // Create an expired token (from 2 hours ago)
        DB::table('password_reset_tokens')->insert([
            'email'      => 'test@example.com',
            'token'      => Hash::make('oldtoken'),
            'created_at' => now()->subHours(2),
        ]);

        $response = $this->postJson('/api/reset-password', [
            'email'                 => 'test@example.com',
            'token'                 => 'oldtoken',
            'password'              => 'newpassword12345',
            'password_confirmation' => 'newpassword12345',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors('token');
    }

    public function test_reset_password_invalid_email(): void
    {
        $response = $this->postJson('/api/reset-password', [
            'email'                 => 'nonexistent@example.com',
            'token'                 => 'sometoken',
            'password'              => 'newpassword12345',
            'password_confirmation' => 'newpassword12345',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors('email');
    }

    public function test_reset_password_mismatched_confirmation(): void
    {
        User::factory()->create(['email' => 'test@example.com']);

        $response = $this->postJson('/api/reset-password', [
            'email'                 => 'test@example.com',
            'token'                 => 'sometoken',
            'password'              => 'newpassword12345',
            'password_confirmation' => 'differentpassword',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors('password');
    }

    public function test_login_with_new_password(): void
    {
        $user = User::factory()->create([
            'email'    => 'test@example.com',
            'password' => 'oldpassword123',
        ]);

        // Generate reset token
        $this->postJson('/api/forgot-password', [
            'email' => 'test@example.com',
        ]);

        // Generate a test token and hash it
        $plainToken = \Illuminate\Support\Str::random(64);
        DB::table('password_reset_tokens')
            ->where('email', 'test@example.com')
            ->update(['token' => Hash::make($plainToken)]);

        // Reset password
        $this->postJson('/api/reset-password', [
            'email'                 => 'test@example.com',
            'token'                 => $plainToken,
            'password'              => 'brandnewpassword123',
            'password_confirmation' => 'brandnewpassword123',
        ]);

        // Try to login with old password (should fail)
        $response = $this->postJson('/api/login', [
            'email'    => 'test@example.com',
            'password' => 'oldpassword123',
        ]);

        $response->assertStatus(422);

        // Try to login with new password (should succeed)
        $response = $this->postJson('/api/login', [
            'email'    => 'test@example.com',
            'password' => 'brandnewpassword123',
        ]);

        $response->assertStatus(200);
    }
}
