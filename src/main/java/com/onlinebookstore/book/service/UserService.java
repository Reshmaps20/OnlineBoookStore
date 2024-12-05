package com.onlinebookstore.book.service;



import com.onlinebookstore.book.repository.UserRepository;
import com.onlinebookstore.book.model.Users;
import com.onlinebookstore.book.store.UserLoginRequest;
import com.onlinebookstore.book.store.UserLoginResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;


    public UserLoginResponse registerUser(UserLoginRequest registerRequest) {
        if (checkUserExists(registerRequest.getUsername())) {
            return createResponse("User already exists!", false);
        }

        registerNewUser(registerRequest);
        return createResponse("Registration successful!", true);
    }

    private UserLoginResponse createResponse(String message, boolean success) {
        return UserLoginResponse.builder()
                .message(message)
                .validResponse (success)
                .build();
    }
    private void registerNewUser (UserLoginRequest registerRequest) {

        Users user = Users.builder ().username (registerRequest.getUsername ())
                .firstname (registerRequest.getFirstName ())
                .lastname (registerRequest.getLastName ())
                .password (passwordEncoder.encode (registerRequest.getPassword ()))
                .build ();
        userRepository.save (user);
    }

    public boolean validateLogin(String username, String password) {
        Optional<Users> user = userRepository.findByUsername (username);
        return (user.isPresent () && passwordEncoder.matches (password, user.get ().getPassword ()));
    }

    public boolean checkUserExists(String username) {
        return userRepository.existsByUsername(username);
    }
}
