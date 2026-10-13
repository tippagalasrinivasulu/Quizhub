package com.quizhub.config;

import com.quizhub.entity.User;
import com.quizhub.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.boot.DefaultApplicationArguments;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AdminBootstrapRunnerTest {
    private final UserRepository users = mock(UserRepository.class);
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    @Test
    void createsAdminOnlyWhenNoAdminExists() {
        when(users.findByRoleOrderByUsernameAsc("ADMIN")).thenReturn(List.of());
        when(users.existsByUsername("quiz-admin")).thenReturn(false);
        when(users.existsByEmail("admin@example.test")).thenReturn(false);

        AdminBootstrapRunner runner = new AdminBootstrapRunner(
                users, encoder, "quiz-admin", "admin@example.test", "a-strong-bootstrap-password");
        runner.run(new DefaultApplicationArguments());

        ArgumentCaptor<User> savedUser = ArgumentCaptor.forClass(User.class);
        verify(users).save(savedUser.capture());
        assertEquals("quiz-admin", savedUser.getValue().getUsername());
        assertEquals("ADMIN", savedUser.getValue().getRole());
        assertTrue(encoder.matches("a-strong-bootstrap-password", savedUser.getValue().getPassword()));
    }

    @Test
    void doesNotResetAnExistingAdminPassword() {
        when(users.findByRoleOrderByUsernameAsc("ADMIN"))
                .thenReturn(List.of(new User("existing-admin", "admin@example.test", "hashed", "ADMIN")));

        AdminBootstrapRunner runner = new AdminBootstrapRunner(users, encoder, "", "", "");
        runner.run(new DefaultApplicationArguments());

        verify(users, never()).save(any(User.class));
    }

    @Test
    void rejectsWeakBootstrapPasswords() {
        when(users.findByRoleOrderByUsernameAsc("ADMIN")).thenReturn(List.of());

        AdminBootstrapRunner runner = new AdminBootstrapRunner(
                users, encoder, "quiz-admin", "admin@example.test", "too-short");

        IllegalStateException error = assertThrows(
                IllegalStateException.class,
                () -> runner.run(new DefaultApplicationArguments()));

        assertEquals("The bootstrap admin password must be at least 12 characters long.", error.getMessage());
        verify(users, never()).save(any(User.class));
    }
}
