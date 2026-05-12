<?php

namespace Tests\Feature;

use App\Models\User;
use Tests\TestCase;

class AuthControllerTest extends TestCase
{
    public function test_register_sukses(): void
    {
        $response = $this->postJson('/api/register', [
            'name'                 => 'John Doe',
            'email'                => 'john@example.com',
            'password'             => 'password123',
            'password_confirmation' => 'password123',
        ]);

        // Register now returns message + email (no token — must verify email first)
        $response->assertStatus(201)
                 ->assertJsonStructure(['message', 'email'])
                 ->assertJsonMissing(['token']);

        $this->assertDatabaseHas('users', [
            'email'             => 'john@example.com',
            'name'              => 'John Doe',
            'email_verified_at' => null, // not yet verified
        ]);
    }

    public function test_register_validasi_email(): void
    {
        User::factory()->create(['email' => 'taken@example.com']);

        $response = $this->postJson('/api/register', [
            'name'                 => 'Jane Doe',
            'email'                => 'taken@example.com',
            'password'             => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors('email');
    }

    public function test_register_dengan_referral_code(): void
    {
        $referrer = User::factory()->create();

        $response = $this->postJson('/api/register', [
            'name'                 => 'Referral User',
            'email'                => 'referral@example.com',
            'password'             => 'password123',
            'password_confirmation' => 'password123',
            'referral_code'        => $referrer->referral_code,
        ]);

        $response->assertStatus(201);

        $user = User::where('email', 'referral@example.com')->first();
        $this->assertEquals($referrer->id, $user->referrer_id);
    }

    public function test_login_sukses(): void
    {
        $user = User::factory()->create(['password' => 'password123']);

        $response = $this->postJson('/api/login', [
            'email'    => $user->email,
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'message',
                     'user' => ['id', 'name', 'email', 'role'],
                     'token',
                 ]);
    }

    public function test_login_invalid(): void
    {
        User::factory()->create(['email' => 'test@example.com']);

        $response = $this->postJson('/api/login', [
            'email'    => 'test@example.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors('email');
    }

    public function test_logout(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('auth-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
                         ->postJson('/api/logout');

        $response->assertStatus(200)
                 ->assertJson(['message' => 'Logout berhasil.']);

        $this->assertDatabaseMissing('personal_access_tokens', [
            'tokenable_id' => $user->id,
        ]);
    }

    public function test_profile_update(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('auth-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
                         ->putJson('/api/user/profile', [
                             'name'    => 'Updated Name',
                             'phone'   => '08123456789',
                             'address' => 'Jl. Test',
                             'city'    => 'Jakarta',
                         ]);

        $response->assertStatus(200)
                 ->assertJson([
                     'message' => 'Profil berhasil diperbarui.',
                     'user'    => [
                         'name'    => 'Updated Name',
                         'phone'   => '08123456789',
                         'address' => 'Jl. Test',
                         'city'    => 'Jakarta',
                     ],
                 ]);
    }

    public function test_password_change(): void
    {
        $user = User::factory()->create(['password' => 'oldpassword123']);
        $token = $user->createToken('auth-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
                         ->putJson('/api/user/password', [
                             'current_password'      => 'oldpassword123',
                             'password'              => 'newpassword123',
                             'password_confirmation' => 'newpassword123',
                         ]);

        $response->assertStatus(200)
                 ->assertJson(['message' => 'Password berhasil diperbarui.']);

        // Verify new password works
        $loginResponse = $this->postJson('/api/login', [
            'email'    => $user->email,
            'password' => 'newpassword123',
        ]);

        $loginResponse->assertStatus(200);
    }

    public function test_password_change_invalid_current(): void
    {
        $user = User::factory()->create(['password' => 'oldpassword123']);
        $token = $user->createToken('auth-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
                         ->putJson('/api/user/password', [
                             'current_password'      => 'wrongpassword',
                             'password'              => 'newpassword123',
                             'password_confirmation' => 'newpassword123',
                         ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors('current_password');
    }
}
