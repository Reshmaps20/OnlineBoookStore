package com.onlinebookstore.book.repository;

import com.onlinebookstore.book.model.ShoppingCartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShoppingCartItemRepository extends JpaRepository<ShoppingCartItem, Long> {
    List<ShoppingCartItem> findByShoppingCartId(Long shoppingCartId);
    void deleteByShoppingCartId(Long shoppingCartId);

}
