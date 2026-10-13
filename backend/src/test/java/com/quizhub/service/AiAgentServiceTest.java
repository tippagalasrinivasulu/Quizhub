package com.quizhub.service;

import com.quizhub.dto.Dtos.GeneratedQuestionDto;
import com.quizhub.repository.QuizRepository;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;

class AiAgentServiceTest {

    private final AiAgentService service = new AiAgentService(mock(QuizRepository.class));

    @Test
    void generatesTheRequestedNumberFromDocumentConceptsWithVariedCorrectPositions() {
        String content = String.join(". ",
                "Digital logic uses Boolean algebra to simplify expressions and design efficient digital circuits",
                "Logic gates combine binary inputs to produce outputs according to defined Boolean operations",
                "A flip-flop stores one bit of information and changes state when triggered by a clock signal",
                "Combinational circuits produce outputs based only on their current input values",
                "Sequential circuits use memory elements to store previous states during operation",
                "Multiplexers select one input from several sources using control signals",
                "A decoder converts binary input values into distinct output signals",
                "Counters advance through a sequence of binary states in response to clock pulses",
                "The Karnaugh map provides a visual method for minimizing Boolean expressions",
                "An encoder converts one active input line into a coded binary output");

        List<GeneratedQuestionDto> questions = service.processQuestionsFromText(content, 10);

        assertEquals(10, questions.size());
        for (int i = 0; i < questions.size(); i++) {
            GeneratedQuestionDto question = questions.get(i);
            assertEquals(i % 4, question.correctOption());
            assertEquals(contentSentenceForQuestion(question, content), question.options().get(question.correctOption()));
        }
    }

    @Test
    void rejectsCreationWhenTheDocumentCannotProduceTheRequestedCount() {
        String content = "A flip-flop stores one bit of information and changes state when triggered by a clock signal.";

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> service.processQuestionsFromText(content, 10));

        assertEquals(400, exception.getStatusCode().value());
    }

    @Test
    void keepsParsedAnswerCorrectWhenMovingItAwayFromOptionA() {
        String paper = """
                Q1. Which answer is correct for the first sample question?
                A) Incorrect first answer
                B) Correct first answer
                C) Incorrect third answer
                D) Incorrect fourth answer
                Answer: B
                Q2. Which answer is correct for the second sample question?
                A) Incorrect first answer
                B) Correct second answer
                C) Incorrect third answer
                D) Incorrect fourth answer
                Answer: B
                """;

        List<GeneratedQuestionDto> questions = service.processQuestionsFromText(paper, 2);

        assertEquals(2, questions.size());
        assertEquals(0, questions.get(0).correctOption());
        assertEquals("Correct first answer", questions.get(0).options().get(questions.get(0).correctOption()));
        assertEquals(1, questions.get(1).correctOption());
        assertEquals("Correct second answer", questions.get(1).options().get(questions.get(1).correctOption()));
    }

    private String contentSentenceForQuestion(GeneratedQuestionDto question, String content) {
        return List.of(content.split("\\. "))
                .stream()
                .filter(sentence -> question.options().contains(sentence))
                .findFirst()
                .orElseThrow();
    }
}
