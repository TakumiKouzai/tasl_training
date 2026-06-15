package com.example.todo.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.todo.entity.Task;
import com.example.todo.mapper.TaskMapper;

@Service
public class TaskService {

    private final TaskMapper taskMapper;

    public TaskService(TaskMapper taskMapper) {
        this.taskMapper = taskMapper;
    }

    public List<Task> findAllTasks() {
        return taskMapper.findAll();
    }

    public void createTask(Task task) {
        taskMapper.insert(task);
    }

    public void updateTask(Task task) {
        taskMapper.update(task);
    }

    public void deleteTask(Long taskId) {
        taskMapper.deleteById(taskId);
    }

    public void updateTaskStatus(Long taskId, String status) {
        taskMapper.updateStatus(taskId, status);
    }
}