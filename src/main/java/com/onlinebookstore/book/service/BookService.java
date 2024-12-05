package com.onlinebookstore.book.service;

import com.onlinebookstore.book.model.Books;
import com.onlinebookstore.book.repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
public class BookService {

    @Autowired
    private BookRepository bookRepository;

    public List<Books> getAllBooks() {
        return bookRepository.findAll();
    }
}
