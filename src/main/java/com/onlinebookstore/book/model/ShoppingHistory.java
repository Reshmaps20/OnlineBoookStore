package com.onlinebookstore.book.model;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Entity
@Data
@Builder
public class ShoppingHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private Users user;

    @OneToMany
    @JoinColumn(name = "history_id")
    private List<BookHistoryDetail> bookDetails;
    private double totalPrice;

}
