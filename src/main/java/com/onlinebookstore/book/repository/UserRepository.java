package com.onlinebookstore.book.repository;

import com.onlinebookstore.book.model.Users;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<Users, Long> {
    Optional<Users> findByUsername(String username);
    List<Users> findAll();
    boolean existsByUsername(String username);
}
