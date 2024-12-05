package com.onlinebookstore.book.controller;

import com.onlinebookstore.book.exception.UnauthorizedException;
import com.onlinebookstore.book.exception.UserNotFoundException;
import com.onlinebookstore.book.service.UserService;
import com.onlinebookstore.book.store.UserLoginRequest;
import com.onlinebookstore.book.store.UserLoginResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class UserController {

    @Autowired
    private UserService userService;


    @PostMapping("/register")
    public ResponseEntity<UserLoginResponse> register(@RequestBody UserLoginRequest registerRequest) {

        UserLoginResponse response = userService.registerUser(registerRequest);

        return ResponseEntity.status(response.getValidResponse ()? HttpStatus.CREATED : HttpStatus.NOT_FOUND)
                .body(response);

    }

    @PostMapping("/login")
    public ResponseEntity<UserLoginResponse> login(@RequestBody UserLoginRequest loginRequest) {

        if (!userService.checkUserExists(loginRequest.getUsername())) {

            throw new UserNotFoundException ("User does not exist!");
        }
        if (!userService.validateLogin(loginRequest.getUsername(), loginRequest.getPassword())) {

            throw new UnauthorizedException ("Invalid username or password!");
        }
        return ResponseEntity.ok(new UserLoginResponse("Login successful!", true));
    }
}
