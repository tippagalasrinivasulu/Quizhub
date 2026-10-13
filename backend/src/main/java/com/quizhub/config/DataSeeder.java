package com.quizhub.config;

import com.quizhub.entity.*;
import com.quizhub.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/** Inserts demo users, quizzes, PYQ papers, and results when explicitly enabled. */
@Component
@ConditionalOnProperty(prefix = "app.seed", name = "demo-data", havingValue = "true")
public class DataSeeder implements CommandLineRunner {
    private final UserRepository users;
    private final QuizRepository quizzes;
    private final ResultRepository results;
    private final PasswordEncoder enc;

    public DataSeeder(UserRepository users, QuizRepository quizzes, ResultRepository results, PasswordEncoder enc) {
        this.users = users;
        this.quizzes = quizzes;
        this.results = results;
        this.enc = enc;
    }

    private User user(String name, String email, String pass, String role, long initialXp) {
        return users.findByUsername(name)
                .or(() -> users.findByEmail(email))
                .orElseGet(() -> {
                    User u = new User(name, email, enc.encode(pass), role);
                    u.setXp(initialXp);
                    return users.save(u);
                });
    }

    private static void q(Quiz z, String text, int correct, String a, String b, String c, String d) {
        z.addQuestion(new Question(text, a, b, c, d, correct));
    }

    @Override
    public void run(String... args) {
        User demo = user("demo", "demo.student@quizhub.com", "demo123", "STUDENT", 850L);
        User priya = user("priya", "priya.sharma@quizhub.com", "pass123", "STUDENT", 1620L);
        User arjun = user("arjun", "arjun.verma@quizhub.com", "pass123", "STUDENT", 1120L);
        User sneha = user("sneha", "sneha.reddy@quizhub.com", "pass123", "STUDENT", 490L);

        if (quizzes.count() > 0) return;

        // 1. Subject: Computer Science - Java
        Quiz java = new Quiz("Java Advanced & Core", "Computer Science", "Core Java, OOP, collections, multithreading.", "Medium", 5, false, null);
        q(java, "Which keyword is used to inherit a class in Java?", 1, "implements", "extends", "inherits", "super");
        q(java, "What is the size of an int in Java?", 2, "8 bits", "16 bits", "32 bits", "64 bits");
        q(java, "Which method is the entry point of a Java program?", 2, "start()", "run()", "main()", "init()");
        q(java, "Which collection does not allow duplicates?", 1, "List", "Set", "ArrayList", "Vector");
        q(java, "Which interface must be implemented for thread execution?", 0, "Runnable", "Cloneable", "Serializable", "Comparable");

        // 2. Subject: Computer Science - Database Systems
        Quiz dbms = new Quiz("Database Management & SQL", "Computer Science", "SQL queries, relational algebra, indexing, and normalization.", "Easy", 4, false, null);
        q(dbms, "Which command retrieves data from a table?", 1, "GET", "SELECT", "FETCH", "OPEN");
        q(dbms, "Which clause filters rows after grouping?", 2, "WHERE", "ORDER BY", "HAVING", "LIMIT");
        q(dbms, "A PRIMARY KEY column must contain:", 2, "Duplicates", "NULL values", "Unique non-null values", "Only numbers");
        q(dbms, "Which join returns only rows with matches in both tables?", 0, "INNER JOIN", "LEFT JOIN", "CROSS JOIN", "FULL JOIN");

        // 3. Subject: Computer Science - Operating Systems
        Quiz os = new Quiz("Operating Systems & Concurrency", "Computer Science", "Process scheduling, deadlocks, virtual memory, and page replacement.", "Hard", 6, false, null);
        q(os, "Which condition is NOT one of Coffman's four deadlock conditions?", 3, "Mutual Exclusion", "Hold and Wait", "No Preemption", "Starvation");
        q(os, "Which scheduling algorithm is non-preemptive?", 1, "Round Robin", "First Come First Served (FCFS)", "SRTF", "Multilevel Feedback");
        q(os, "Thrashing occurs when:", 2, "CPU is idling", "A deadlock is resolved", "Page fault rate is excessively high", "RAM is fully wiped");
        q(os, "Belady's Anomaly occurs primarily in which page replacement algorithm?", 0, "FIFO", "LRU", "Optimal", "Clock");

        // 4. Subject: Data Structures - Algorithms
        Quiz dsa = new Quiz("Data Structures & Algorithms", "Data Structures", "Trees, graphs, dynamic programming, and complexity analysis.", "Hard", 8, false, null);
        q(dsa, "What is the average time complexity of QuickSort?", 1, "O(n)", "O(n log n)", "O(n^2)", "O(log n)");
        q(dsa, "Which data structure is best for Breadth-First Search (BFS)?", 2, "Stack", "Priority Queue", "Queue", "Heap");
        q(dsa, "What is the worst-case lookup time in a Red-Black Tree with n nodes?", 0, "O(log n)", "O(n)", "O(1)", "O(n log n)");
        q(dsa, "Which algorithm finds the Single-Source Shortest Path with non-negative weights?", 3, "Kruskal's", "Prim's", "Floyd-Warshall", "Dijkstra's");

        // 5. Subject: Electronics - Digital Electronics
        Quiz digital = new Quiz("Digital Electronics & Logic", "Electronics", "Logic gates, Boolean algebra, flip-flops, and counters.", "Medium", 5, false, null);
        q(digital, "Which gate outputs 1 only when both inputs are 1?", 3, "OR", "XOR", "NOT", "AND");
        q(digital, "The Boolean expression A + A' equals:", 0, "1", "0", "A", "A'");
        q(digital, "A flip-flop stores:", 2, "Continuous wave", "Analog voltage", "One bit of binary data", "No data");
        q(digital, "Which logic family is known for lowest power consumption?", 1, "TTL", "CMOS", "RTL", "DTL");

        // 6. Subject: Electronics - Communication Systems
        Quiz comm = new Quiz("Communication Systems", "Electronics", "Modulation, channel capacity, Nyquist rate, and RF basics.", "Medium", 5, false, null);
        q(comm, "Amplitude modulation directly varies the carrier's:", 1, "Frequency", "Amplitude", "Phase", "Noise figure");
        q(comm, "The Shannon-Hartley theorem determines:", 0, "Channel capacity limit", "Resistor resistance", "Transistor beta", "Carrier wavelength");
        q(comm, "Nyquist sampling theorem states sampling frequency must be at least:", 2, "Half max frequency", "Equal to max frequency", "Twice the max frequency", "Four times max frequency");

        // 7. Subject: Mathematics & Logic - Discrete Mathematics
        Quiz math = new Quiz("Discrete Mathematics & Logic", "Mathematics", "Set theory, propositional logic, graph theory, and combinatorics.", "Medium", 6, false, null);
        q(math, "If a set S has n elements, what is the size of its power set P(S)?", 1, "n^2", "2^n", "n!", "2n");
        q(math, "A graph without any cycles is known as an:", 3, "Eulerian graph", "Complete graph", "Bipartite graph", "Acyclic graph (Forest/Tree)");
        q(math, "Which logic law states ~(P and Q) = ~P or ~Q?", 0, "De Morgan's Law", "Associative Law", "Distributive Law", "Idempotent Law");

        // 8. Subject: PYQ Papers - GATE CSE 2024
        Quiz gatePyq = new Quiz("GATE CSE 2024 Previous Paper", "PYQ Papers", "Official previous year paper questions from Computer Science GATE exam.", "Hard", 10, true, "GATE 2024");
        q(gatePyq, "Consider a computer with 48-bit virtual address and 4 KB page size. How many pages are in the virtual address space?", 2, "2^32", "2^40", "2^36", "2^48");
        q(gatePyq, "In relational algebra, which operation is NOT primitive?", 1, "Selection", "Natural Join", "Projection", "Cartesian Product");
        q(gatePyq, "The language L = {a^n b^n c^n | n >= 1} is:", 3, "Regular", "Context-Free", "Deterministic Context-Free", "Context-Sensitive");
        q(gatePyq, "TCP uses which protocol mechanism to avoid network congestion?", 0, "Slow Start & Congestion Avoidance", "Token Ring", "ALOHA", "Stop-and-Wait ARQ");

        // 9. Subject: PYQ Papers - ISRO Scientist 2023
        Quiz isroPyq = new Quiz("ISRO Scientist Computer Science PYQ", "PYQ Papers", "Previous year exam questions asked in ISRO Scientist/Engineer recruitment.", "Hard", 10, true, "ISRO 2023");
        q(isroPyq, "Which OSI layer is responsible for end-to-end flow control and error recovery?", 2, "Network Layer", "Data Link Layer", "Transport Layer", "Session Layer");
        q(isroPyq, "In software engineering, Cyclomatic Complexity is computed as:", 1, "E - N", "E - N + 2P", "N - E + 1", "E + N - P");
        q(isroPyq, "Which cache mapping technique allows a memory block to be placed anywhere in cache?", 0, "Fully Associative", "Direct Mapped", "2-Way Set Associative", "Sector Mapped");

        java = quizzes.save(java);
        dbms = quizzes.save(dbms);
        os = quizzes.save(os);
        dsa = quizzes.save(dsa);
        digital = quizzes.save(digital);
        comm = quizzes.save(comm);
        math = quizzes.save(math);
        gatePyq = quizzes.save(gatePyq);
        isroPyq = quizzes.save(isroPyq);

        results.save(new Result(demo, java, 5, 5, 120, 150, "🏆 Century Club"));
        results.save(new Result(demo, dbms, 4, 4, 90, 130, "⚡ Speed Century"));
        results.save(new Result(demo, gatePyq, 3, 4, 280, 80, "🥇 Gold Scholar"));

        results.save(new Result(priya, java, 5, 5, 110, 150, "🏆 Century Club"));
        results.save(new Result(priya, dsa, 4, 4, 190, 130, "🏆 Century Club"));
        results.save(new Result(priya, gatePyq, 4, 4, 240, 130, "🏆 Century Club"));
        results.save(new Result(priya, isroPyq, 3, 3, 140, 110, "⚡ Speed Century"));

        results.save(new Result(arjun, os, 4, 4, 150, 130, "🏆 Century Club"));
        results.save(new Result(arjun, digital, 4, 4, 130, 130, "🏆 Century Club"));
        results.save(new Result(arjun, comm, 3, 3, 110, 110, "⚡ Speed Century"));

        results.save(new Result(sneha, math, 3, 3, 120, 110, "🏆 Century Club"));
        results.save(new Result(sneha, dbms, 3, 4, 130, 60, "🥇 Gold Scholar"));
    }
}
