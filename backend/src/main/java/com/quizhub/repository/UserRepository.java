package com.quizhub.repository;

import com.quizhub.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    List<User> findByRoleOrderByUsernameAsc(String role);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
}
