package com.quizhub.controller;

import com.quizhub.dto.Dtos.*;
import com.quizhub.service.QuizService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final QuizService svc;

    public AdminController(QuizService svc) {
        this.svc = svc;
    }

    @GetMapping("/students/performance")
    public List<StudentPerformance> studentPerformance() {
        return svc.studentPerformance();
    }

    @GetMapping("/students/{username}/results")
    public List<HistoryItem> studentHistory(@PathVariable String username) {
        return svc.studentHistory(username);
    }

    @PostMapping("/quizzes")
    public QuizSummary createQuiz(@Valid @RequestBody QuizRequest r) {
        return svc.createQuiz(r);
    }

    @DeleteMapping("/quizzes/{id}")
    public void deleteQuiz(@PathVariable Long id) {
        svc.deleteQuiz(id);
    }

    @GetMapping("/quizzes/{id}/questions")
    public List<AdminQuestion> questions(@PathVariable Long id) {
        return svc.questionsOf(id);
    }

    @PostMapping("/questions")
    public AdminQuestion add(@Valid @RequestBody QuestionRequest r) {
        return svc.addQuestion(r);
    }

    @DeleteMapping("/questions/{id}")
    public void delete(@PathVariable Long id) {
        svc.deleteQuestion(id);
    }
}
