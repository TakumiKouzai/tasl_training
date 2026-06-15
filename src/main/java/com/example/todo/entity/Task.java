package com.example.todo.entity;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class Task {

    private Long id;

    private String title;

    private String description;

    private String priority;

    private String status;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}