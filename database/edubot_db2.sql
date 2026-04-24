-- ============================================================
-- EduBot Database Schema + Seed Data
-- MIT Academy of Engineering, Pune (SPPU SE Curriculum)
-- Run: mysql -u root -p < edubot.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS edubot_db;
USE edubot_db;

-- ============================================================
-- TABLE: years
-- ============================================================
CREATE TABLE IF NOT EXISTS years (
  id INT AUTO_INCREMENT PRIMARY KEY,
  year_code VARCHAR(10) NOT NULL UNIQUE,
  year_name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE: semesters
-- ============================================================
CREATE TABLE IF NOT EXISTS semesters (
  id INT AUTO_INCREMENT PRIMARY KEY,
  year_id INT NOT NULL,
  sem_number INT NOT NULL,
  sem_label VARCHAR(20) NOT NULL,
  description TEXT,
  FOREIGN KEY (year_id) REFERENCES years(id) ON DELETE CASCADE
);

-- ============================================================
-- TABLE: subjects
-- ============================================================
CREATE TABLE IF NOT EXISTS subjects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  semester_id INT NOT NULL,
  subject_code VARCHAR(20),
  subject_name VARCHAR(200) NOT NULL,
  short_name VARCHAR(50),
  credits INT DEFAULT 4,
  subject_type ENUM('theory','lab','project','elective') DEFAULT 'theory',
  overview TEXT,
  key_topics TEXT,
  tools_used TEXT,
  difficulty_level ENUM('easy','medium','hard') DEFAULT 'medium',
  FOREIGN KEY (semester_id) REFERENCES semesters(id) ON DELETE CASCADE
);

-- ============================================================
-- TABLE: tools
-- ============================================================
CREATE TABLE IF NOT EXISTS tools (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tool_name VARCHAR(100) NOT NULL,
  category VARCHAR(100),
  overview TEXT,
  pros TEXT,
  cons TEXT,
  use_cases TEXT,
  official_url VARCHAR(255),
  used_in_year VARCHAR(50),
  used_in_subject VARCHAR(200)
);

-- ============================================================
-- TABLE: chat_logs
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id VARCHAR(100),
  user_message TEXT NOT NULL,
  bot_response TEXT NOT NULL,
  intent VARCHAR(100),
  subject_matched VARCHAR(200),
  response_time_ms INT,
  feedback ENUM('positive','negative','neutral') DEFAULT 'neutral',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE: users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(200) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(200),
  year_of_study VARCHAR(10),
  role ENUM('student','admin','teacher') DEFAULT 'student',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL
);

-- ============================================================
-- TABLE: faqs
-- ============================================================
CREATE TABLE IF NOT EXISTS faqs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category VARCHAR(100),
  tags VARCHAR(255),
  views INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- SEED DATA: YEARS
-- ============================================================
INSERT INTO years (year_code, year_name, description) VALUES
('FY', 'First Year', 'Foundation year covering core engineering basics, mathematics, physics, chemistry and introduction to programming.'),
('SY', 'Second Year', 'Core computer science subjects — Data Structures, OOP, DBMS, OS, CN, Web Tech and more.'),
('TY', 'Third Year', 'Advanced subjects — Machine Learning, AI, Cloud Computing, IoT, Security and specialization electives.'),
('BE', 'Final Year (BE)', 'Deep Learning, Big Data, industry internship, and capstone project development.');

-- ============================================================
-- SEED DATA: SEMESTERS
-- ============================================================
INSERT INTO semesters (year_id, sem_number, sem_label, description) VALUES
(1, 1, 'FY Sem 1', 'Mathematics, Physics, Chemistry, Electrical, Mechanics, Graphics'),
(1, 2, 'FY Sem 2', 'C Programming, Electronics, Math-II, Communication Skills'),
(2, 3, 'SY Sem 3', 'DS, OOP Java, DBMS, Discrete Math, CO, M3'),
(2, 4, 'SY Sem 4', 'OS, CN, TOC, SE, Web Tech, M4'),
(3, 5, 'TY Sem 5', 'ML, STQA, DAA, IoT, Elective I, Mini Project'),
(3, 6, 'TY Sem 6', 'AI, Information Security, Cloud Computing, Elective II, Project I'),
(4, 7, 'BE Sem 7', 'Deep Learning, Big Data Analytics, Elective III, Project II'),
(4, 8, 'BE Sem 8', 'Internship, Project Completion, Seminar, MOOCs');

-- ============================================================
-- SEED DATA: SUBJECTS — FY Sem 1
-- ============================================================
INSERT INTO subjects (semester_id, subject_code, subject_name, short_name, credits, subject_type, overview, key_topics, tools_used, difficulty_level) VALUES
(1, 'FEC101', 'Engineering Mathematics - I', 'M1', 4, 'theory',
 'Foundational calculus and algebra. Covers limits, differentiation, integration, and matrix algebra essential for all engineering branches.',
 'Limits and continuity, Differentiation rules, Partial derivatives, Successive differentiation, Rolles theorem, Mean value theorems, Taylors and Maclaurins series, Indeterminate forms (L-Hospital rule), Matrices (Cayley-Hamilton, eigenvalues), Multivariable calculus',
 'MATLAB, Wolfram Alpha, Scientific Calculator, GeoGebra',
 'hard'),

(1, 'FEC102', 'Engineering Physics', 'EP', 4, 'theory',
 'Covers optics, lasers, semiconductors, superconductors and fiber optics. Builds intuition for hardware and electronic devices.',
 'Interference (Youngs double slit, Newtons rings), Diffraction (single/double slit), Polarization, Lasers (types, applications), Fiber optics (numerical aperture, types of fibers), Semiconductors (band theory, p-n junction), Superconductors (Meissner effect), Ultrasonics',
 'Lab experiments with optical benches, spectrometers',
 'medium'),

(1, 'FEC103', 'Engineering Chemistry', 'EC', 4, 'theory',
 'Chemistry of materials, water, fuels and polymers relevant to engineering applications.',
 'Electrochemistry (galvanic cells, EMF), Corrosion (types, prevention), Polymers (addition, condensation, rubber), Fuels (calorific value, Bomb calorimeter), Lubricants (viscosity, additives), Water treatment (hardness, softening), Nanomaterials, Composites',
 'Analytical balance, pH meter, Titration setup',
 'medium'),

(1, 'FEC104', 'Basic Electrical Engineering', 'BEE', 4, 'theory',
 'DC and AC circuit analysis, transformers, and electrical machines. Foundation for all hardware-related courses.',
 'Kirchhoffs laws, Thevenins and Nortons theorem, Superposition theorem, AC circuits (phasors, impedance, resonance), Three-phase systems, Transformers (construction, working, efficiency), DC motors and generators, Earthing and safety',
 'Breadboard, Multimeter, Lab oscilloscope, Tinkercad',
 'medium'),

(1, 'FEC105', 'Engineering Mechanics', 'EM', 4, 'theory',
 'Study of forces, equilibrium, kinematics and kinetics of particles and rigid bodies.',
 'Statics — concurrent/non-concurrent forces, Free body diagrams, Friction, Centroid and moment of inertia, Dynamics — kinematics, Newtons laws, Work-energy theorem, Impulse-momentum, Virtual work principle',
 'MATLAB, scientific calculator',
 'medium'),

(1, 'FEC106', 'Engineering Graphics', 'EG', 3, 'lab',
 'Technical drawing and 2D/3D representations used in engineering design.',
 'BIS drawing standards, Orthographic projections, Isometric views, Section views, Development of surfaces, Introduction to AutoCAD 2D drafting, Dimensioning standards',
 'AutoCAD, Drawing instruments',
 'easy'),

(1, 'FEC107', 'Workshop Practice', 'WSP', 2, 'lab',
 'Hands-on manufacturing and workshop skills.',
 'Carpentry, Fitting (marking, filing, drilling), Welding (arc, gas), Sheet metal work, Casting basics, Plastic moulding introduction',
 'Hand tools, lathe machine, welding equipment',
 'easy');

-- ============================================================
-- SEED DATA: SUBJECTS — FY Sem 2
-- ============================================================
INSERT INTO subjects (semester_id, subject_code, subject_name, short_name, credits, subject_type, overview, key_topics, tools_used, difficulty_level) VALUES
(2, 'FEC201', 'Engineering Mathematics - II', 'M2', 4, 'theory',
 'Advanced calculus covering differential equations, Laplace transforms, Fourier series and vector calculus.',
 'Ordinary differential equations (first order, higher order), Method of undetermined coefficients, Variation of parameters, Laplace transforms (properties, inverse, convolution), Fourier series (half range, Parsevals theorem), Beta and Gamma functions, Vector calculus (gradient, divergence, curl), Greens, Stokes and Gauss theorems',
 'MATLAB, Wolfram Alpha, Symbolab',
 'hard'),

(2, 'FEC202', 'Programming and Problem Solving (C)', 'PPS', 4, 'theory',
 'Introduction to programming using C language. Teaches algorithmic thinking, flowcharts, and hands-on coding.',
 'Algorithms and flowcharts, C basics (data types, variables, operators), Control flow (if-else, switch), Loops (for, while, do-while), Functions (recursion, call by value/reference), Arrays (1D, 2D, strings), Pointers (pointer arithmetic, pointers and arrays), Structures and Unions, File handling (fopen, fread, fwrite), Dynamic memory allocation (malloc, calloc, free)',
 'GCC compiler, Turbo C, VS Code, CodeBlocks, Dev-C++',
 'medium'),

(2, 'FEC203', 'Basic Electronics Engineering', 'BEE2', 4, 'theory',
 'Introduces semiconductor devices, amplifiers, digital logic gates and flip-flops.',
 'Diodes (rectifiers, Zener), Transistors (BJT — CE, CB, CC configurations), FET and MOSFET basics, Op-Amp (inverting, non-inverting, summing amplifier, comparator), Logic gates (AND, OR, NOT, NAND, NOR, XOR), Boolean algebra, Combinational circuits (adder, subtractor, MUX), Flip-flops (SR, JK, D, T), Counters and Registers',
 'Multisim, Tinkercad, breadboard kits',
 'medium'),

(2, 'FEC204', 'Engineering Mathematics - III Basics', 'M2B', 2, 'theory',
 'Numerical methods and basic statistics for engineering problem solving.',
 'Bisection method, Newton-Raphson method, Gaussian elimination, Numerical integration (Simpsons, Trapezoidal), Curve fitting, Regression (linear, multiple), Probability basics, Binomial and Poisson distributions',
 'Excel, MATLAB, Scilab',
 'medium'),

(2, 'FEC205', 'Communication Skills', 'CS', 2, 'theory',
 'English communication, technical writing and presentation skills for professional readiness.',
 'Grammar and vocabulary, Technical report writing, Formal email writing, Presentation skills, Group discussion techniques, Interview preparation, Resume writing, Listening and reading comprehension',
 'MS Word, PowerPoint, Grammarly',
 'easy'),

(2, 'FEC206', 'Environmental Studies', 'EVS', 2, 'theory',
 'Awareness of environment, ecology, pollution control and sustainable development.',
 'Ecosystems and biodiversity, Natural resources (water, forests, minerals), Types of pollution (air, water, soil, noise), Waste management (solid waste, e-waste, biomedical), Environmental laws and acts (India), Climate change and global warming, Sustainable development, Environmental Impact Assessment',
 'Google Earth, pollution monitoring tools',
 'easy');

-- ============================================================
-- SEED DATA: SUBJECTS — SY Sem 3
-- ============================================================
INSERT INTO subjects (semester_id, subject_code, subject_name, short_name, credits, subject_type, overview, key_topics, tools_used, difficulty_level) VALUES
(3, 'SE2301', 'Engineering Mathematics - III', 'M3', 4, 'theory',
 'Advanced mathematics covering complex analysis, transforms and statistics — essential for signal processing and machine learning.',
 'Complex numbers (Cauchy-Riemann equations), Laplace transform (advanced), Fourier transform and inverse, Z-transform, Probability (Bayes theorem, conditional probability), Random variables (discrete and continuous), Statistical distributions (Binomial, Poisson, Normal), Hypothesis testing (chi-square, t-test), Correlation and regression',
 'MATLAB, Python (scipy, numpy), Wolfram Alpha',
 'hard'),

(3, 'SE2302', 'Data Structures', 'DS', 4, 'theory',
 'Core subject for all software engineers. Covers essential data structures and algorithms with time/space complexity analysis.',
 'Arrays and strings, Linked lists (singly, doubly, circular), Stacks (infix to postfix, balanced parentheses), Queues (simple, circular, deque, priority queue), Trees (binary tree, BST, AVL tree, heap), Tree traversals (inorder, preorder, postorder), Graphs (adjacency matrix, adjacency list, BFS, DFS), Hashing (hash functions, collision handling), Sorting (bubble, selection, insertion, merge, quick, heap), Searching (linear, binary), Big-O notation (time and space complexity)',
 'C, C++, VS Code, GCC, online judge (LeetCode, HackerRank)',
 'hard'),

(3, 'SE2303', 'Digital Electronics and Computer Organization', 'DECO', 4, 'theory',
 'Bridges electronics and computer hardware — teaches how computers work at the circuit level.',
 'Number systems (binary, octal, hex, BCD), Boolean algebra and minimization (Karnaugh map), Combinational circuits (adder, subtractor, comparator, multiplexer, demultiplexer, encoder, decoder), Sequential circuits (SR, JK, D, T flip-flops), Registers and shift registers, Counters (synchronous, asynchronous), Memory (RAM, ROM, Cache), CPU architecture (ALU, Control Unit, registers, buses), Instruction set architecture, Addressing modes, Pipelining basics',
 'Logisim, Multisim, Proteus, Digital logic simulators',
 'medium'),

(3, 'SE2304', 'Object Oriented Programming using Java', 'OOP', 4, 'theory',
 'Introduces object-oriented paradigm through Java. One of the most important subjects in the SE curriculum.',
 'OOP concepts (classes, objects, encapsulation, inheritance, polymorphism, abstraction), Constructors (default, parameterized, copy), Method overloading and overriding, Interfaces and abstract classes, Packages and access specifiers, Exception handling (try-catch-finally, custom exceptions), Java Collections (ArrayList, LinkedList, HashMap, HashSet, Stack, Queue, TreeMap), Generics, Multithreading (Thread class, Runnable, synchronization), Java I/O streams, Java 8 features (lambda, streams, Optional), Introduction to JavaFX',
 'Eclipse, IntelliJ IDEA, VS Code, JDK 17+, Maven, Gradle',
 'medium'),

(3, 'SE2305', 'Database Management Systems', 'DBMS', 4, 'theory',
 'Essential for backend development. Covers relational databases, SQL, normalization and transactions.',
 'Data models (hierarchical, network, relational), ER diagram (entities, attributes, relationships, cardinality), Relational algebra and calculus, SQL (DDL — CREATE TABLE, DROP, ALTER; DML — SELECT, INSERT, UPDATE, DELETE; DCL — GRANT, REVOKE; TCL — COMMIT, ROLLBACK), SQL joins (INNER, LEFT, RIGHT, FULL OUTER, SELF JOIN), Views, Indexes, Stored procedures, Triggers, Functions, Normalization (1NF, 2NF, 3NF, BCNF), Transactions and ACID properties, Concurrency control (two-phase locking), Deadlock in databases, File organization and indexing (B+ tree)',
 'MySQL, MySQL Workbench, PostgreSQL, Oracle 11g, SQLite',
 'medium'),

(3, 'SE2306', 'Discrete Mathematics', 'DM', 4, 'theory',
 'Mathematical foundation for computer science — logic, sets, relations, graph theory and combinatorics.',
 'Sets (operations, power set, Cartesian product), Relations (reflexive, symmetric, transitive, equivalence), Functions (injective, surjective, bijective), Propositional logic (connectives, truth tables, tautology), Predicate logic and quantifiers, Proof techniques (induction, contradiction, contrapositive), Combinatorics (permutations, combinations, pigeonhole principle, inclusion-exclusion), Graph theory (types of graphs, Euler and Hamiltonian paths, spanning trees, shortest path), Trees (binary trees, spanning trees, Kruskal and Prims), Lattices and Boolean algebra, Recurrence relations and generating functions',
 'LaTeX, GeoGebra, Python (sympy)',
 'hard');

-- ============================================================
-- SEED DATA: SUBJECTS — SY Sem 4
-- ============================================================
INSERT INTO subjects (semester_id, subject_code, subject_name, short_name, credits, subject_type, overview, key_topics, tools_used, difficulty_level) VALUES
(4, 'SE2401', 'Engineering Mathematics - IV', 'M4', 4, 'theory',
 'Numerical methods, complex analysis and advanced statistics. Directly applicable in simulation and ML.',
 'Numerical methods (Bisection, Newton-Raphson, Secant, False position), Numerical solutions of ODEs (Euler, Runge-Kutta 4th order), Numerical integration (Simpsons 1/3, 3/8), System of equations (Gauss elimination, Gauss-Seidel), Complex analysis (Cauchy-Riemann, analytic functions, conformal mapping, contour integration), Probability distributions (Binomial, Poisson, Normal, Exponential), Sampling theory and estimation, Hypothesis testing (t-test, chi-square test, ANOVA)',
 'MATLAB, Python (scipy, numpy), Excel',
 'hard'),

(4, 'SE2402', 'Computer Networks', 'CN', 4, 'theory',
 'Explains how the internet and network communication works — from bits on a wire to application protocols.',
 'OSI reference model (7 layers and functions), TCP/IP model, Physical layer (transmission media, modulation, multiplexing), Data link layer (framing, error detection — CRC and Hamming code, error correction, flow control — sliding window, HDLC, Ethernet), Network layer (IP addressing, subnetting, CIDR, routing algorithms — Dijkstra and Bellman-Ford, OSPF, RIP, NAT, ICMP), Transport layer (TCP — 3-way handshake, congestion control, flow control; UDP; port numbers), Application layer (HTTP/HTTPS, FTP, SMTP, POP3, IMAP, DNS, DHCP, SNMP), Network security basics (SSL/TLS, firewalls)',
 'Cisco Packet Tracer, Wireshark, ns3, PuTTY, VirtualBox',
 'hard'),

(4, 'SE2403', 'Operating Systems', 'OS', 4, 'theory',
 'Explains how the OS manages hardware resources. Critical for systems programming and interviews.',
 'OS structure (monolithic, microkernel, layered), Process management (PCB, process states, context switching), CPU scheduling algorithms (FCFS, SJF, Round Robin, Priority, MLFQ), Process synchronization (race condition, critical section, mutex, semaphores, monitors), Inter-process communication (pipes, message queues, shared memory), Deadlock (conditions, prevention — Bankers algorithm, detection, recovery), Memory management (contiguous allocation, paging, segmentation, virtual memory, TLB, page replacement algorithms — FIFO, LRU, Optimal), File systems (FAT, ext4, inodes, directory structure), Disk scheduling (FCFS, SSTF, SCAN, C-SCAN, C-LOOK), I/O management',
 'Linux (Ubuntu), Shell scripting (Bash), VMware, VirtualBox, GCC',
 'hard'),

(4, 'SE2404', 'Theory of Computation', 'TOC', 4, 'theory',
 'Theoretical foundation of computer science — what problems can computers solve and how efficiently.',
 'Finite automata (DFA, NFA, epsilon-NFA), Equivalence of DFA and NFA, Regular expressions and languages, Closure properties of regular languages, Pumping lemma for regular languages, Context-free grammars (derivation, parse tree, ambiguity), Pushdown automata (deterministic PDA, NPDA), Chomsky normal form, CYK parsing algorithm, Turing machines (DTM, NTM, multi-tape TM), Church-Turing thesis, Decidability and undecidability, Halting problem, P, NP, NP-complete, NP-hard problems, Reductions',
 'JFLAP (automata simulator), Python (formal language libraries)',
 'hard'),

(4, 'SE2405', 'Software Engineering', 'SE', 4, 'theory',
 'Teaches how to manage and develop large software projects professionally.',
 'SDLC models (Waterfall, Incremental, Spiral, RAD, Agile, Scrum, Kanban, XP), Requirements engineering (functional, non-functional, SRS document), System modeling (DFD, ER, UML), UML diagrams (use case, class, sequence, activity, state chart, component, deployment), Software design (coupling, cohesion, design patterns — Singleton, Factory, Observer, MVC, Strategy), Project planning (WBS, Gantt chart, PERT/CPM), Software metrics (LOC, function points, cyclomatic complexity), Software testing (unit, integration, system, acceptance, regression, performance), Software quality (ISO 9001, CMMI levels), COCOMO model, Risk management',
 'draw.io, StarUML, Lucidchart, GitHub, JIRA, Trello, MS Project',
 'medium'),

(4, 'SE2406', 'Web Technology', 'WT', 4, 'theory',
 'Full stack web development basics. One of the most practically useful subjects for placements.',
 'HTML5 (semantic elements, forms, tables, multimedia), CSS3 (selectors, box model, flexbox, grid, animations, responsive design, media queries), JavaScript ES6 (variables, functions, DOM manipulation, events, fetch API, promises, async-await, arrow functions, classes, modules), jQuery basics, Bootstrap 5, AJAX and JSON, XML and DTD, Node.js (event loop, modules, npm), Express.js (routing, middleware, REST API), Template engines (EJS, Handlebars), MySQL with Node.js, Introduction to React.js (components, props, state, hooks), PHP basics, REST API design principles, Postman for API testing',
 'VS Code, Node.js, npm, MySQL, Postman, Chrome DevTools, GitHub',
 'medium');

-- ============================================================
-- SEED DATA: SUBJECTS — TY Sem 5
-- ============================================================
INSERT INTO subjects (semester_id, subject_code, subject_name, short_name, credits, subject_type, overview, key_topics, tools_used, difficulty_level) VALUES
(5, 'SE3501', 'Machine Learning', 'ML', 4, 'theory',
 'Teaches computers to learn from data. One of the most in-demand skills in the industry right now.',
 'Types of ML (supervised, unsupervised, reinforcement), Data preprocessing (missing values, encoding, normalization, feature selection, PCA), Supervised algorithms (Linear Regression, Polynomial Regression, Logistic Regression, Decision Tree, Random Forest, SVM, KNN, Naive Bayes), Unsupervised algorithms (K-Means, Hierarchical Clustering, DBSCAN, PCA), Model evaluation (train-test split, cross-validation, confusion matrix, accuracy, precision, recall, F1-score, ROC-AUC), Overfitting and underfitting (bias-variance tradeoff, regularization — L1, L2), Ensemble methods (Bagging, Boosting, AdaBoost, Gradient Boosting, XGBoost), Feature engineering, Hyperparameter tuning (GridSearchCV, RandomSearchCV)',
 'Python, NumPy, Pandas, Scikit-learn, Matplotlib, Seaborn, Jupyter Notebook, Google Colab, Kaggle',
 'hard'),

(5, 'SE3502', 'Software Testing and Quality Assurance', 'STQA', 4, 'theory',
 'Teaches how to find bugs and ensure software quality — a critical skill for any software engineer.',
 'Software testing principles (7 principles), Testing levels (unit, integration, system, acceptance), Testing types (functional, non-functional, regression, smoke, sanity, performance, load, stress, security), Black-box testing (equivalence partitioning, boundary value analysis, decision table, state transition), White-box testing (statement coverage, branch coverage, path coverage, cyclomatic complexity), Grey-box testing, Test-driven development (TDD), Behavior-driven development (BDD), Test documentation (test plan, test cases, test report, defect report), Defect lifecycle, Test management (JIRA), CI/CD and automated testing (Jenkins, GitHub Actions), Code review and static analysis (SonarQube)',
 'Selenium WebDriver, JUnit 5, TestNG, JIRA, Jenkins, Postman, SonarQube, Apache JMeter',
 'medium'),

(5, 'SE3503', 'Design and Analysis of Algorithms', 'DAA', 4, 'theory',
 'Advanced algorithms — the most important subject for cracking product company interviews.',
 'Complexity analysis (Big-O, Omega, Theta, amortized analysis), Divide and conquer (merge sort, quick sort, binary search, Strassens matrix multiplication), Greedy algorithms (fractional knapsack, activity selection, Huffman coding, Kruskals MST, Prims MST, Dijkstras shortest path), Dynamic programming (memoization vs tabulation, 0/1 knapsack, LCS, LIS, matrix chain multiplication, coin change, edit distance, Floyd-Warshall, Bellman-Ford), Backtracking (N-Queens, graph coloring, Hamiltonian path, Sudoku solver, subset sum), Branch and bound (0/1 knapsack), String matching (naive, KMP, Rabin-Karp), NP-completeness (polynomial reductions, SAT, 3-SAT, vertex cover, travelling salesman), Approximation algorithms',
 'Python, C++, LeetCode, GeeksforGeeks, Competitive programming platforms',
 'hard'),

(5, 'SE3504', 'Internet of Things', 'IoT', 4, 'theory',
 'Connects the physical world to the internet — smart devices, sensors and real-time systems.',
 'IoT architecture (perception, network, application layers), Sensors (temperature, humidity, PIR, ultrasonic, light) and actuators (motors, relays, LEDs), Microcontrollers (Arduino Uno, Arduino Mega, ESP8266, ESP32) vs microprocessors (Raspberry Pi), Communication protocols (MQTT, CoAP, HTTP/REST, Bluetooth, Zigbee, LoRa, NFC, RFID), IoT platforms (ThingSpeak, Blynk, AWS IoT Core, Google Cloud IoT, Azure IoT Hub), Edge computing basics, Smart home systems, Smart agriculture, Industrial IoT (IIoT), Healthcare IoT, Security in IoT, Introduction to RTOS',
 'Arduino IDE, Raspberry Pi OS, Tinkercad (circuit simulation), MQTT broker (Mosquitto), ThingSpeak',
 'medium'),

(5, 'SE3505', 'Mini Project I', 'MP1', 2, 'project',
 'Small team project (2-3 students) to apply SY concepts in a real-world scenario.',
 'Problem identification, Literature survey, System design (ER diagram, DFD, UML), Frontend development, Backend development, Database integration, Testing, Project report writing, Viva preparation',
 'Based on project domain — typically VS Code, Node.js/Python, MySQL, GitHub, draw.io',
 'medium');

-- ============================================================
-- SEED DATA: SUBJECTS — TY Sem 6
-- ============================================================
INSERT INTO subjects (semester_id, subject_code, subject_name, short_name, credits, subject_type, overview, key_topics, tools_used, difficulty_level) VALUES
(6, 'SE3601', 'Artificial Intelligence', 'AI', 4, 'theory',
 'Builds intelligent systems that reason, plan, learn and perceive — the theoretical backbone of modern AI.',
 'AI history and applications, Intelligent agents (PEAS framework, types of agents), Search algorithms (uninformed — BFS, DFS, UCS, IDS; informed — greedy best-first, A*, AO*), Adversarial search (minimax, alpha-beta pruning, game playing), Constraint satisfaction problems (backtracking, arc consistency, AC-3), Knowledge representation (propositional logic, first-order predicate logic, inference rules, resolution), Semantic networks and frames, Expert systems (inference engine, knowledge base, CLIPS), Uncertainty (Bayesian networks, probability), Fuzzy logic (membership functions, fuzzy inference), Genetic algorithms, Planning (STRIPS, blocks world), Natural language processing basics, Computer vision basics',
 'Python, AIMA code library, Prolog, Weka, CLIPS expert system shell',
 'hard'),

(6, 'SE3602', 'Information Security', 'IS', 4, 'theory',
 'Teaches how to protect data, systems and networks from cyber attacks. Critical skill in modern software development.',
 'Security goals (CIA triad — Confidentiality, Integrity, Availability), Cryptography basics, Symmetric encryption (DES, 3DES, AES — block cipher modes ECB, CBC, CFB), Asymmetric encryption (RSA algorithm, Diffie-Hellman key exchange, ECC), Hash functions (MD5, SHA-1, SHA-256, SHA-3), Digital signatures and certificates, PKI (Public Key Infrastructure), SSL/TLS handshake, Network security (firewalls — packet filtering, stateful; IDS/IPS; VPN; IPSec), Web security (SQL injection, Cross-site scripting XSS, CSRF, IDOR, insecure deserialization), OWASP Top 10 vulnerabilities, Ethical hacking phases (reconnaissance, scanning, exploitation, post-exploitation), Secure coding practices, Steganography, Biometrics',
 'Kali Linux, Wireshark, OpenSSL, Metasploit (educational), Burp Suite (community), Nmap',
 'hard'),

(6, 'SE3603', 'Cloud Computing', 'CC', 4, 'theory',
 'Modern software is deployed on cloud. This subject teaches AWS/Azure/GCP and cloud-native development.',
 'Cloud computing introduction (NIST definition, characteristics), Service models (IaaS, PaaS, SaaS, FaaS/Serverless), Deployment models (public, private, hybrid, community cloud), Virtualization (hypervisors Type 1/2, VMware, VirtualBox, KVM), Containers (Docker — Dockerfile, images, containers, volumes, networks; Docker Compose), Container orchestration (Kubernetes — pods, deployments, services, ingress, namespaces), AWS services (EC2, S3, RDS, Lambda, Elastic Beanstalk, CloudFront, Route 53, IAM, VPC, CloudWatch), Azure basics (VMs, Blob Storage, Azure SQL, Azure Functions), GCP basics, Cloud storage architecture, Cloud databases (RDS, DynamoDB, Firebase Firestore), Serverless computing (AWS Lambda, Google Cloud Functions), Microservices architecture, Cloud security and compliance, Cost optimization',
 'AWS Free Tier, Docker Desktop, Kubernetes (Minikube), Terraform basics, Postman, VS Code',
 'hard'),

(6, 'SE3604', 'Project I', 'P1', 6, 'project',
 'First phase of the major capstone project. Problem identification, research, design and prototype.',
 'Problem statement formulation, Literature review and gap analysis, Technology selection, System architecture design, Database schema design, UML diagrams, Frontend prototype (Figma/actual code), Backend API design, Basic implementation, Testing and documentation, Mid-semester review, Final report and presentation',
 'Based on project choice — React/Node.js/Python/MySQL/MongoDB, GitHub, draw.io, Figma, LaTeX/MS Word',
 'medium');

-- ============================================================
-- SEED DATA: SUBJECTS — BE Sem 7 & 8
-- ============================================================
INSERT INTO subjects (semester_id, subject_code, subject_name, short_name, credits, subject_type, overview, key_topics, tools_used, difficulty_level) VALUES
(7, 'SE4701', 'Deep Learning', 'DL', 4, 'theory',
 'State-of-the-art AI — neural networks that power image recognition, language models, and generative AI.',
 'Artificial neural networks (perceptron, MLP, activation functions — ReLU, sigmoid, tanh, softmax), Backpropagation algorithm, Optimizers (SGD, Momentum, Adam, RMSprop, AdaGrad), Regularization (dropout, batch normalization, L1/L2), CNNs (convolution, pooling, padding, LeNet, AlexNet, VGG, ResNet, InceptionNet), Transfer learning and fine-tuning, Object detection (YOLO, SSD, Faster R-CNN), Image segmentation (U-Net, Mask R-CNN), RNNs (vanishing gradient problem, LSTM, GRU), Sequence-to-sequence models, Attention mechanism, Transformers (BERT, GPT architecture), GANs (generator, discriminator, training instability), Autoencoders (vanilla, variational), Diffusion models basics',
 'Python, TensorFlow 2.x, Keras, PyTorch, Google Colab (GPU), HuggingFace Transformers, CUDA',
 'hard'),

(7, 'SE4702', 'Big Data Analytics', 'BDA', 4, 'theory',
 'Processing and analyzing massive datasets that cannot fit in memory — the backbone of modern data engineering.',
 'Big data characteristics (5 Vs — Volume, Velocity, Variety, Veracity, Value), Hadoop ecosystem (HDFS architecture, MapReduce programming model, YARN), Apache Hive (HQL, partitioning, bucketing), Apache Pig (Pig Latin), HBase (column-family store, CRUD), Apache Spark (RDDs, DataFrames, Datasets, transformations vs actions, lazy evaluation), Spark SQL, Spark MLlib, Spark Streaming and Structured Streaming, Apache Kafka (producers, consumers, topics, partitions), NoSQL databases (MongoDB — documents, collections, aggregation pipeline; Cassandra — wide column store; Redis — in-memory cache), Data lakes vs data warehouses, ETL pipelines, Data visualization (Tableau, Power BI, Grafana), Real-time analytics, Cloud-based big data (AWS EMR, Google BigQuery, Azure HDInsight)',
 'Hadoop, Apache Spark (PySpark), MongoDB, Kafka, Tableau, Power BI, Python, Jupyter Notebook, AWS EMR',
 'hard'),

(7, 'SE4703', 'Project II', 'P2', 8, 'project',
 'Final year capstone project — full implementation, testing, deployment and documentation of a real-world system.',
 'Complete implementation of Project I prototype, Advanced features development, Database optimization, API development and integration, Frontend development, Security implementation, Performance testing, Deployment (cloud/local server), User manual, Complete project report (IEEE format), Journal/conference paper (optional), Final presentation and viva',
 'Full technology stack as per project, AWS/Heroku deployment, GitHub, LaTeX',
 'hard'),

(8, 'SE4801', 'Industry Internship', 'INT', 10, 'project',
 '6-month internship at a Pune IT company or startup. Real industry experience.',
 'On-the-job training, Industry project work, Technologies vary by company, Code reviews and team collaboration, Agile/Scrum methodology in practice, Client communication, Monthly progress reports, Final internship report and presentation',
 'Depends on company — typically React/Angular, Node.js/Spring Boot, MySQL/PostgreSQL, AWS/Azure, Jira, Git',
 'medium');

-- ============================================================
-- SEED DATA: TOOLS
-- ============================================================
INSERT INTO tools (tool_name, category, overview, pros, cons, use_cases, official_url, used_in_year, used_in_subject) VALUES

('VS Code', 'IDE/Editor',
 'Visual Studio Code is a free, open-source code editor by Microsoft. It is the most popular editor for web and software development worldwide.',
 'Free and open source, Excellent IntelliSense (autocomplete), Huge extension marketplace (Python, Java, C++, Node.js extensions), Built-in Git integration, Integrated terminal, Remote development support, Live Share for collaboration',
 'Can be slow with too many extensions, Not a full IDE (no built-in debugger for all languages), Electron-based so uses more RAM than lightweight editors',
 'Web development (HTML/CSS/JS), Node.js development, Python scripts, Java development, C/C++ programming',
 'https://code.visualstudio.com', 'FY to BE', 'All programming subjects'),

('MySQL', 'Database',
 'MySQL is the world''s most popular open-source relational database management system used in web applications and enterprise software.',
 'Free and open source, Easy to learn, Excellent community support, Works great with Node.js/PHP/Python, MySQL Workbench provides good GUI, Fast for read-heavy workloads, ACID compliant',
 'Not ideal for very large-scale analytics, Limited support for complex JSON operations compared to PostgreSQL, Less advanced features than Oracle',
 'Web application backends, E-commerce sites, Student management systems, Banking applications, Content management systems',
 'https://www.mysql.com', 'SY to BE', 'DBMS, Web Technology, Project'),

('Git & GitHub', 'Version Control',
 'Git is a distributed version control system. GitHub is a hosting platform for Git repositories. Together they enable collaborative software development.',
 'Industry standard for version control, Free for public repositories, GitHub provides CI/CD (Actions), Code review through pull requests, Portfolio building, Open source contribution',
 'Git has a steep learning curve initially, Merge conflicts can be tricky, Large binary files not handled well',
 'All software projects, Team collaboration, Open source contribution, Portfolio showcase, CI/CD pipelines',
 'https://github.com', 'FY to BE', 'All project subjects, Software Engineering'),

('Python', 'Programming Language',
 'Python is a high-level, general-purpose programming language known for its simplicity and versatility. It is the go-to language for data science, ML and automation.',
 'Simple and readable syntax, Huge standard library, Best ML/AI ecosystem (TensorFlow, PyTorch, Scikit-learn), Great for automation and scripting, Large community, Versatile (web, ML, automation, scripting)',
 'Slower than C/C++/Java for computation, GIL limits multi-threading, Not ideal for mobile development, Higher memory usage',
 'Machine learning and AI, Data analysis and visualization, Web development (Django, Flask), Automation and scripting, Scientific computing',
 'https://www.python.org', 'TY to BE', 'Machine Learning, AI, Deep Learning, Big Data'),

('Java', 'Programming Language',
 'Java is a class-based, object-oriented programming language designed for portability. It runs on the JVM and is widely used in enterprise and Android development.',
 'Platform independent (Write Once Run Anywhere), Strong type system reduces bugs, Excellent for large-scale enterprise applications, Rich ecosystem (Spring, Hibernate, Maven), Good IDE support, Android development',
 'Verbose syntax compared to Python, Slower startup time, More memory usage, Not ideal for scripting',
 'Android app development, Enterprise backend (Spring Boot), Banking and financial systems, Web services (REST APIs)',
 'https://www.oracle.com/java/', 'SY', 'OOP, Software Engineering'),

('Node.js', 'Backend Framework',
 'Node.js is a JavaScript runtime built on Chrome V8 engine that allows running JavaScript on the server side.',
 'JavaScript on both frontend and backend (full-stack), Non-blocking asynchronous I/O, Very fast for I/O-heavy applications, Large npm package ecosystem, Easy to build REST APIs with Express',
 'Not ideal for CPU-heavy tasks, Callback hell (mitigated by promises/async-await), Single-threaded model, Weaker than Java/Python for enterprise-scale apps',
 'REST API backends, Real-time applications (chat, notifications), Microservices, Serverless functions',
 'https://nodejs.org', 'SY to BE', 'Web Technology, EduBot Project'),

('React.js', 'Frontend Framework',
 'React is a JavaScript library for building user interfaces. Developed by Facebook. Uses component-based architecture and virtual DOM.',
 'Component reusability, Virtual DOM for performance, Huge ecosystem, React Native for mobile, Great for SPAs, Strong industry demand',
 'Just a view library (need additional tools for routing, state management), JSX learning curve, Frequent updates',
 'Single page applications, Dashboard UIs, Social media UIs, Admin panels',
 'https://reactjs.org', 'SY to BE', 'Web Technology, Project'),

('Docker', 'DevOps/Containerization',
 'Docker is a platform for containerizing applications — packaging code with all dependencies so it runs consistently anywhere.',
 'Consistent environments across dev/test/prod, Fast deployment, Lightweight compared to VMs, Easy scaling with Docker Compose, Industry standard for DevOps',
 'Learning curve for Dockerfile writing, Networking can be complex, Storage management is non-trivial, Not as isolated as VMs',
 'Application deployment, Microservices, CI/CD pipelines, Development environment standardization',
 'https://www.docker.com', 'TY to BE', 'Cloud Computing, DevOps elective'),

('TensorFlow/Keras', 'ML/DL Framework',
 'TensorFlow is Google''s open-source ML platform. Keras is its high-level API. Together they are the most widely used deep learning framework.',
 'Production-ready, TensorFlow Serving for deployment, TensorFlow Lite for mobile, Large community, Excellent documentation, TensorBoard for visualization',
 'Steeper learning curve than PyTorch for research, Static computation graphs (TF 1.x), Verbose code',
 'Deep learning model development, Image classification, NLP models, Model deployment',
 'https://www.tensorflow.org', 'BE', 'Deep Learning, Machine Learning'),

('Cisco Packet Tracer', 'Networking Tool',
 'Cisco Packet Tracer is a network simulation tool that allows students to design, configure and troubleshoot network topologies.',
 'Free for Cisco NetAcad students, Realistic network simulation, Supports routers, switches, PCs, IoT devices, Great for learning networking without physical hardware',
 'Not as accurate as real hardware, Limited protocol support compared to GNS3, Requires Cisco NetAcad registration',
 'CN labs — routing, switching, subnetting, VLAN, DHCP, DNS simulation',
 'https://www.netacad.com/courses/packet-tracer', 'SY', 'Computer Networks'),

('Jupyter Notebook', 'Data Science Tool',
 'Jupyter Notebook is an interactive computing environment where you can write code, equations, visualizations and text in one document.',
 'Excellent for data exploration and visualization, Mix of code and documentation, Easy to share (nbformat), Supports Python, R, Julia, Widely used in academia and industry',
 'Not ideal for production code, Version control with Git is messy, Can encourage bad coding practices',
 'Data analysis, ML experiments, Teaching and tutorials, Research reports',
 'https://jupyter.org', 'TY to BE', 'Machine Learning, Deep Learning, Big Data'),

('MATLAB', 'Scientific Computing',
 'MATLAB is a numerical computing environment widely used in engineering mathematics, signal processing and control systems.',
 'Excellent matrix operations, Built-in toolboxes for signal/image processing, Good visualization, Industry standard in many engineering domains',
 'Expensive commercial license, Not open source (Octave is the free alternative), Not ideal for web or app development',
 'Engineering mathematics (M1, M2, M3), Signal processing, Control systems, Simulation',
 'https://www.mathworks.com', 'FY to SY', 'Engineering Mathematics I, II, III');

-- ============================================================
-- SEED DATA: FAQs
-- ============================================================
INSERT INTO faqs (question, answer, category, tags) VALUES

('What is the SPPU Software Engineering curriculum structure?',
 'SPPU B.Tech Software Engineering is a 4-year, 8-semester program. FY (Sem 1-2) covers engineering fundamentals — math, physics, chemistry, C programming. SY (Sem 3-4) covers core CS — DS, OOP Java, DBMS, OS, CN, Web Tech. TY (Sem 5-6) covers advanced topics — ML, AI, Security, Cloud, IoT. BE (Sem 7-8) covers Deep Learning, Big Data, and includes a 6-month industry internship.',
 'curriculum', 'SPPU,SE,curriculum,structure'),

('What programming languages should I learn each year?',
 'FY: C language (PPS subject), basic MATLAB. SY Sem 3: C++ for DS lab, Java for OOP. SY Sem 4: JavaScript, HTML, CSS, Node.js for Web Tech, Shell scripting for OS lab. TY: Python (ML, AI), IoT uses C++ for Arduino. BE: Python (DL with TensorFlow/PyTorch), PySpark for Big Data. Always learn Git/GitHub from FY itself.',
 'learning', 'programming languages, study guide'),

('How do I prepare for placement interviews from MIT AOE Pune?',
 'For Tier 1 companies (Google, Amazon, Microsoft): Master DSA (Data Structures from SY Sem 3 + DAA from TY Sem 5), competitive coding on LeetCode/Codeforces, 2-3 strong projects on GitHub. For IT service companies (TCS, Infosys, Wipro): Basic aptitude, good communication, knowledge of Java/Python and DBMS. Start from SY — build projects, keep GitHub active, get certifications (AWS, Google, NPTEL). Participate in hackathons.',
 'placement', 'placement, interview, career'),

('What is the difference between Data Structures and DAA?',
 'Data Structures (SY Sem 3) teaches you WHAT to store data in — arrays, linked lists, trees, graphs, hash tables — and basic algorithms like sorting and searching. Design and Analysis of Algorithms (TY Sem 5) teaches you HOW to design efficient algorithms — Divide and Conquer, Greedy, Dynamic Programming, Backtracking — and analyzes their time/space complexity. DS is a prerequisite for DAA.',
 'subjects', 'DS, DAA, algorithms, data structures'),

('What mini project topics are good for SY Software Engineering?',
 'Good SY project ideas using the subjects you have learned: 1) Student Management System (Java + MySQL + JDBC), 2) Online Quiz App (Node.js + Express + MySQL), 3) E-Commerce Website (HTML/CSS/JS + Node.js + MySQL), 4) Library Management System (Java Swing + MySQL), 5) College Event Portal (HTML/CSS/JS + PHP + MySQL), 6) Bus Tracking System (Node.js + MySQL + Google Maps API), 7) Hospital Appointment System (React + Node.js + MySQL). Choose based on what subjects you are strongest in.',
 'projects', 'mini project, SY, project ideas'),

('How does EduBot work technically?',
 'EduBot uses a three-tier architecture: 1) Frontend — HTML5, CSS3, JavaScript chat interface. 2) Backend — Node.js with Express.js handles API requests, fetches subject data from MySQL, and calls the Anthropic Claude API for NLP-powered responses. 3) Database — MySQL stores all curriculum data (subjects, tools, FAQs, chat logs). When you ask a question, the backend searches the MySQL knowledge base, combines it with a system prompt, sends it to the Claude API, and returns a structured response.',
 'system', 'EduBot, architecture, how it works'),

('What is the difference between Machine Learning and Deep Learning?',
 'Machine Learning (TY Sem 5) is a broader field where algorithms learn patterns from data. It includes classical algorithms like Linear Regression, SVM, Decision Trees, and K-Means. Deep Learning (BE Sem 7) is a subset of ML that uses multi-layer neural networks (deep neural networks) to automatically learn features from raw data. Deep Learning excels at images (CNNs), text (Transformers/BERT), and speech. ML requires manual feature engineering; Deep Learning learns features automatically but requires much more data and computing power.',
 'concepts', 'ML, DL, machine learning, deep learning, AI');

-- ============================================================
-- Default admin user (password: admin123 — change in production!)
-- ============================================================
INSERT INTO users (username, email, password_hash, full_name, role) VALUES
('admin', 'admin@mitaoe.ac.in', '$2b$10$placeholder_hash_change_this', 'EduBot Admin', 'admin');

COMMIT;

SELECT 'EduBot database seeded successfully!' AS status;
SELECT COUNT(*) AS total_subjects FROM subjects;
SELECT COUNT(*) AS total_tools FROM tools;
SELECT COUNT(*) AS total_faqs FROM faqs;
