package com.quizhub.config;

import com.quizhub.entity.User;
import com.quizhub.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(prefix = "app.admin.bootstrap", name = "enabled", havingValue = "true")
public class AdminBootstrapRunner implements ApplicationRunner {
    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final String username;
    private final String email;
    private final String password;

    public AdminBootstrapRunner(
            UserRepository users,
            PasswordEncoder passwordEncoder,
            @Value("${ADMIN_BOOTSTRAP_USERNAME:}") String username,
            @Value("${ADMIN_BOOTSTRAP_EMAIL:}") String email,
            @Value("${ADMIN_BOOTSTRAP_PASSWORD:}") String password) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.username = username;
        this.email = email;
        this.password = password;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!users.findByRoleOrderByUsernameAsc("ADMIN").isEmpty()) {
            return;
        }
        if (username.isBlank() || email.isBlank() || password.isBlank()) {
            throw new IllegalStateException(
                    "Admin bootstrap is enabled, but ADMIN_BOOTSTRAP_USERNAME, ADMIN_BOOTSTRAP_EMAIL, and ADMIN_BOOTSTRAP_PASSWORD are required.");
        }
        if (password.length() < 12) {
            throw new IllegalStateException("The bootstrap admin password must be at least 12 characters long.");
        }
        if (users.existsByUsername(username) || users.existsByEmail(email)) {
            throw new IllegalStateException("The bootstrap admin username or email is already assigned to another account.");
        }

        users.save(new User(username, email, passwordEncoder.encode(password), "ADMIN"));
    }
}
