package com.onlinebookstore.book.service;

import com.onlinebookstore.book.model.*;
import com.onlinebookstore.book.repository.*;
import com.onlinebookstore.book.store.BookDetails;
import com.onlinebookstore.book.store.BookRequest;
import com.onlinebookstore.book.store.CartRequest;
import com.onlinebookstore.book.store.CartResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ShoppingCartService {

    @Autowired
    private ShoppingCartRepository shoppingCartRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ShoppingCartItemRepository shoppingCartItemRepository;

    @Autowired
    private ShoppingHistoryRepository shoppingHistoryRepository;

    @Autowired
    private BookHistoryDetailsRepository bookHistoryDetailsRepository;


    public List<CartResponse> getCartItems(Long userId) {

        ShoppingCart shoppingCart = shoppingCartRepository.findByUserId(userId)
                .orElse(null);

        if (shoppingCart == null) {
            return Collections.emptyList();
        }

        List<ShoppingCartItem> shoppingCartItems = shoppingCartItemRepository.findByShoppingCartId(shoppingCart.getId());

        return shoppingCartItems.stream().map(item ->  {
            BookDetails bookdetails = createBookDetails(item.getBook ());
            return createCartResponse(item,bookdetails);
        }).collect (Collectors.toList ());
    }

    private CartResponse createCartResponse (ShoppingCartItem item, BookDetails bookdetails) {

        return CartResponse.builder()
                .id(item.getId())
                .book(bookdetails)
                .quantity(item.getQuantity())
                .build();
    }

    private BookDetails createBookDetails (Books item) {

        return BookDetails.builder ().id (item.getId ())
                .title (item.getTitle ())
                .author (item.getAuthor ())
                .price (item.getPrice ()).build ();

    }


    @Transactional
    public List<CartResponse> updateCart(Long userId, CartRequest cartRequests) {

        ShoppingCart cart = getOrCreateShoppingCart(userId);

        if (cartRequests.getItems ().isEmpty()) {
            handleEmptyCart (cart);
            return new ArrayList<>();
        }

        if (cartRequests.getOrdered ()) {
            addToHistoryTable(cart.getUser().getId(), cartRequests.getItems());
            handleEmptyCart (cart);
            return new ArrayList<>();
        }
        return updateCartItems(cart, cartRequests.getItems ());
    }

    @Transactional
    private void addToHistoryTable(Long userId, List<BookRequest> bookRequests) {

        List<BookHistoryDetail> bookHistory = bookRequests.stream()
                .map(request -> BookHistoryDetail.builder()
                        .bookId(request.getBookId())
                        .quantity(request.getQuantity())
                        .build())
                .collect(Collectors.toList());

        bookHistory.forEach(bookHistoryDetail -> bookHistoryDetailsRepository.save(bookHistoryDetail));

        double totalPrice = calculateTotalPrice(bookRequests);
        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));


        shoppingHistoryRepository.save(ShoppingHistory.builder ().user (user)
                .bookDetails (bookHistory)
                .totalPrice (totalPrice).build ());
    }


    private double calculateTotalPrice(List<BookRequest> bookRequests) {
        double totalPrice = 0.0;

        for (BookRequest request : bookRequests) {
            double bookPrice = getBookPriceById(request.getBookId());
            totalPrice += bookPrice * request.getQuantity();
        }
        return totalPrice;
    }

    private double getBookPriceById(Long bookId) {

        Books book = bookRepository.findById(bookId).orElseThrow(() -> new RuntimeException("Book not found"));
        return book.getPrice();
    }
    private List<CartResponse> updateCartItems(ShoppingCart cart, List<BookRequest> cartRequests) {


        shoppingCartItemRepository.deleteByShoppingCartId(cart.getId());

        return cartRequests.stream()
                .map(request -> {
                    ShoppingCartItem newItem = createCartItem(cart, request);
                    shoppingCartItemRepository.save(newItem);
                    return mapToCartResponse(newItem, request);
                })
                .collect(Collectors.toList());
    }

    private CartResponse mapToCartResponse(ShoppingCartItem cartItem, BookRequest request) {

        return CartResponse.builder()
                .id(cartItem.getId())
                .book(createBookDetails(cartItem.getBook()))
                .quantity(request.getQuantity())
                .build();
    }

    private ShoppingCartItem createCartItem(ShoppingCart cart, BookRequest request) {

        Books book = getBookById(request.getBookId());
        return ShoppingCartItem.builder ().shoppingCart (cart)
                .book (book).quantity (request.getQuantity()).build ();
    }
    private void handleEmptyCart (ShoppingCart cart) {
        shoppingCartItemRepository.deleteByShoppingCartId(cart.getId());
        shoppingCartRepository.deleteById(cart.getId ());
    }

    private ShoppingCart getOrCreateShoppingCart(Long userId) {
        return shoppingCartRepository.findByUserId(userId)
                .orElseGet(() -> createNewShoppingCart(userId));
    }

    private Books getBookById(Long bookId) {
        return bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found"));
    }

    private ShoppingCart createNewShoppingCart(Long userId) {
        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ShoppingCart newCart = ShoppingCart.builder()
                .user(user)
                .build();

        return shoppingCartRepository.save(newCart);
    }

}
