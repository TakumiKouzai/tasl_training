package com.example.todo.controller;

import java.util.List;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.example.todo.entity.Task;
import com.example.todo.service.TaskService;

@Controller
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping("/")
    public String root() {
        return "redirect:/tasks";
    }

    @GetMapping("/tasks")
    public String tasks(Model model) {
        List<Task> tasks = taskService.findAllTasks();
        model.addAttribute("tasks", tasks);
        return "task/task-list";
    }

    @PostMapping("/tasks/new")
    public String createTask(Task task) {
        taskService.createTask(task);
        return "redirect:/tasks";
    }

    @PostMapping("/tasks/{taskId}/edit")
    public String editTask(@PathVariable Long taskId, Task task) {
        task.setId(taskId);
        taskService.updateTask(task);
        return "redirect:/tasks";
    }

    @PostMapping("/tasks/{taskId}/delete")
    public String deleteTask(@PathVariable Long taskId) {
        taskService.deleteTask(taskId);
        return "redirect:/tasks";
    }

    @PostMapping("/tasks/{taskId}/update-status")
    public String updateTaskStatus(@PathVariable Long taskId,
                                   @RequestParam String status) {
        taskService.updateTaskStatus(taskId, status);
        return "redirect:/tasks";
    }
}