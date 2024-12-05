package com.onlinebookstore.book.controller;

import com.onlinebookstore.book.model.Users;
import com.onlinebookstore.book.service.ShoppingCartService;
import com.onlinebookstore.book.store.CartRequest;
import com.onlinebookstore.book.store.CartResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
public class ShoppingCartController {

    @Autowired
    private ShoppingCartService shoppingCartService;


    @GetMapping
    public ResponseEntity<List<CartResponse>> getCartItems() {
        Users currentUser = getCurrentUser ();
        List<CartResponse> cartItems = shoppingCartService.getCartItems(currentUser.getId ());
        System.out.println("cartItems = " + cartItems);

        return ResponseEntity.ok(cartItems);
    }
    public Users getCurrentUser(){

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return (Users) authentication.getPrincipal();
    }


    @PostMapping("/updateCart")
    public ResponseEntity<List<CartResponse>> updateCart(@RequestBody CartRequest cartRequests) {

        Users currentUser = getCurrentUser();
        System.out.println("cartRequests:" + cartRequests);
        System.out.println("isOrder value: " + cartRequests.getOrdered ());

        List<CartResponse> response = shoppingCartService.updateCart(currentUser.getId(), cartRequests);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}
