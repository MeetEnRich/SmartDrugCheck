# SMART DRUG CHECK

**BY**

**OMOKEHNI, Omonefe**
*(2021/CP/CSC/0302)*

---

A PROJECT REPORT SUBMITTED TO THE DEPARTMENT OF COMPUTER SCIENCE, FACULTY OF COMPUTING, IN PARTIAL FULFILLMENT OF THE REQUIREMENTS FOR THE AWARD OF BACHELOR OF SCIENCE (BSc) DEGREE IN COMPUTER SCIENCE OF FEDERAL UNIVERSITY OF LAFIA.

**APRIL, 2026**

---

## TABLE OF CONTENTS

- Title Page — i
- Table of Contents — ii
- **Chapter One: Introduction** — 1
  - 1.1 Background of the Study — 1
  - 1.2 Statement of the Problem — 1
  - 1.3 Aim and Objectives — 2
  - 1.4 Scope of the Study — 3
  - 1.5 Significance of the Study — 3
  - 1.6 Definition of Terms — 4
  - 1.7 Organization of Work — 5
- **Chapter Two: Literature Review** — 7
  - 2.1 Conceptual Review — 7
  - 2.2 Theoretical Review — 7
  - 2.3 Review of Related Works — 8
  - 2.4 Table of Summary of Related Works — 12
  - 2.5 Summary of Reviewed Literature and Gaps — 14
- **Chapter Three: System Analysis and Methodology** — 16
  - 3.1 Analysis of Existing System (NAFDAC MAS) — 16
  - 3.1.1 Advantages of the Existing System — 16
  - 3.1.2 Disadvantages of the Existing System — 16
  - 3.2 Analysis of the New System — 17
  - 3.2.1 Justification for the New System — 17
  - 3.3 Methodology Adopted (Agile Methodology) — 17
  - 3.4 High-Level Model — 18
  - 3.4.1 Block Diagram — 18
  - 3.4.2 Architecture Diagram (3-Tier Architecture) — 18
  - 3.4.3 Use Case Diagram — 19
  - 3.5 Specifications — 20
  - 3.5.1 Program Module Specification — 20
  - 3.5.2 Database Design (ER Diagram) — 20
  - 3.5.3 Input/Output Design — 20
  - 3.5.4 Data Dictionary — 21
  - 3.5.5 Algorithms and Pseudocode — 21
  - 3.5.6 Evaluation of Security (SQLi Detection) — 21
  - 3.6 System Flowchart — 22
- References — 23

---

## CHAPTER ONE: INTRODUCTION

### 1.1 Background of the Study

The pharmaceutical supply chain is one of the most critical infrastructures in any national health system. However, its integrity is globally threatened by substandard and falsified (SF) medical products. Falsified medicines are those that deliberately misrepresent their identity or source (World Health Organization, 2017b). In the Nigerian context, the National Agency for Food and Drug Administration and Control (NAFDAC) has identified that counterfeit antibiotics and antimalarials are primary drivers of treatment failure and the escalation of antimicrobial resistance (Ewanlen & Aigbiremolen, 2025; Ojugo et al., 2024).

Current practices in Nigeria rely on the Mobile Authentication Service (MAS), which was deployed in 2010 to put the power of detection in the hands of consumers (Ayodokun, 2018). While MAS introduced the "scratch and text" concept, the system has faced a decline due to network latencies, high failure rates of SMS queries, and the exclusion of non-internet-enabled drug categories (Mefor-Nwachukwu, 2026). The "Smart Drug Check" initiative represents a transition toward a web-based application environment. As a software developer with 5 years of experience, I recognize that a modern web system leveraging real-time database cross-referencing and automated analytics can provide a more robust, data-rich defense against pharmaceutical fraud than traditional SMS models.

### 1.2 Statement of the Problem

Despite regulatory interventions, the Nigerian pharmaceutical market remains porous due to several inefficiencies in the existing verification infrastructure:

- **Response Latency and Technical Instability:** SMS queries are often delayed by over 20 minutes or fail entirely due to GSM network congestion, leaving consumers vulnerable at the point of sale (Mefor-Nwachukwu, 2026; Wogu et al., 2019).

- **Inclusivity and Accessibility Barriers:** The backup for failed SMS — voice calls — excludes hearing-impaired users and those in low-network coverage areas, while infant syrups and over-the-counter drugs often lack unique PINs (Mefor-Nwachukwu, 2026; Said et al., 2023).

- **Advanced Cloning Tactics:** Counterfeiters now employ high-resolution printing to clone NAFDAC registration numbers and trademarks, making manual visual inspection unreliable for the average citizen (Chika & Onwuka, 2020; Oketa et al., 2019).

- **Professional Skill Gaps:** Approximately 30.7% of Nigerian pharmacists feel their current knowledge is insufficient to detect sophisticated fakes, yet they hold the primary responsibility for dispensing (Adigwe et al., 2022).

### 1.3 Aim and Objectives

The primary aim of this project is to design and implement a "Smart Drug Check" web application that enables real-time detection of counterfeit drugs by cross-referencing drug details with the official NAFDAC Green Book database.

The specific objectives are:

- To design a responsive web-based user interface that facilitates the manual entry and scanning of NAFDAC Registration Numbers (NRN).
- To develop a middleware integration logic that securely queries the NAFDAC registered products database via API or web-scraping protocols.
- To implement an automated reporting module that logs metadata from failed authentications for regulatory surveillance.
- To evaluate the system's performance based on response time and accuracy in distinguishing between registered and unregistered medical products.

### 1.4 Scope of the Study

The scope of this project is extensively defined to ensure technical focus and regulatory alignment:

- **Technological Framework:** The study covers the development of a web application (Frontend and Backend) that interacts with government databases. It does not include physical chemical analysis of drug compositions or the manufacture of handheld hardware.

- **Database Integration:** The system will specifically cross-reference the NAFDAC Green Book, which currently hosts over 9,000 registered entries (NAFDAC, 2025). Key fields for verification include Product Name, Active Ingredients, NRN, Applicant Name, and Approval Status (NAFDAC, 2025).

- **Target Product Classes:** Priority is given to antimalarials, antibiotics, and antihypertensives, which have been identified as high-risk classes for counterfeiting in Nigeria (Ewanlen & Aigbiremolen, 2025).

- **Operational Boundary:** The application is optimized for the Nigerian pharmaceutical supply chain, utilizing NAFDAC's specific regulatory nomenclature and numbering systems.

### 1.5 Significance of the Study

This project is significant because it provides a multifaceted solution to a lethal public health problem:

- **For Consumers:** It empowers them with a free, instant, and data-rich tool to verify medications before purchase, significantly reducing the 700,000 annual deaths globally attributed to inauthentic malaria and TB drugs (Sproxil, 2025).

- **For Pharmacists:** It serves as a professional decision-support system to verify stock legitimacy, helping to mitigate the 33% rate of unintentional dispensing of fakes identified in practice (Adigwe et al., 2022).

- **For NAFDAC:** The automated reporting module acts as a digital surveillance tool, providing real-time data on geographic "hotspots" where failed scans are occurring, thus aiding enforcement (NAFDAC, 2018).

- **For Pharmaceutical Manufacturers:** It protects brand equity and revenue by making it increasingly difficult for counterfeiters to pass off fakes as legitimate registered products.

- **For Researchers:** It provides a template for integrating "open data" from government portals into consumer-facing web applications in developing economies.

### 1.6 Definition of Terms

- **API (Application Programming Interface):** A set of protocols that allows the web application to communicate and exchange data with external servers.

- **Green Book:** The official, dynamic NAFDAC database that consolidates detailed data on all approved medical products in Nigeria (NAFDAC, 2024).

- **GTIN (Global Trade Item Number):** A unique identifier used to distinguish products globally, assigned based on GS1 standards (Ejeh et al., 2024).

- **Middleware:** The server-side logic layer (Python/Django) that handles the processing of user queries and database interaction.

- **NRN (NAFDAC Registration Number):** The unique code assigned to a drug by NAFDAC to certify that it has been evaluated and approved for the Nigerian market (NAFDAC, 2024).

- **OCR (Optical Character Recognition):** Technology used to convert images of printed text on drug packaging into machine-readable data for authentication.

- **Serialization:** Assigning a unique, traceable digital identity (serial number) to each individual unit of a drug product (Infosys, 2022).

- **SQL Injection (SQLi):** A security vulnerability where malicious SQL statements are inserted into an entry field for execution to manipulate the database.

- **Substandard and Falsified (SF) Medicines:** Medical products that either fail to meet quality specifications or are deliberately misrepresented in terms of identity or source (World Health Organization, 2017b).

### 1.7 Organization of Work

This documentation is structured as follows:

- **Chapter One:** Introduction — Provides the background, problem statement, objectives, scope, significance, and definitions essential to understanding the "Smart Drug Check" initiative.

- **Chapter Two:** Literature Review — Explores the conceptual and theoretical foundations of drug traceability and extensively reviews 15 related works (2020–2025) with a summary of identified gaps.

- **Chapter Three:** System Analysis and Methodology — Details the analysis of the existing NAFDAC MAS system, the design of the new web application, and the adoption of the Agile methodology. It includes high-level models, architecture diagrams, and technical specifications.

- **Chapter Four:** System Design and Implementation — Covers the actual development phase, including the selection of programming tools, database schema implementation, and final user interface screenshots.

- **Chapter Five:** Summary, Conclusion, and Recommendations — Synthesizes the project findings and provides recommendations for future policy and technological enhancements.

---

## CHAPTER TWO: LITERATURE REVIEW

### 2.1 Conceptual Review

The conceptual framework of this study is rooted in Pharma 4.0, the digital transformation of the pharmaceutical supply chain. The core concept is Supply Chain Integrity, which aims to ensure a "closed" distribution system where every entity is licensed and regulated (U.S. Food & Drug Administration, 2020).

A critical component is Serialization, the process of giving a unique, traceable serial number to individual units of a product, typically encoded in 2D barcodes or QR codes (Tiga Healthcare, 2024). This is extended by Aggregation, which establishes a "parent-child" logic between units, cartons, and pallets, enabling high-volume verification at distribution centers (Infosys, 2022; Systech, 2025). Finally, Traceability allows for "forward tracking" (monitoring movement to the consumer) and "backward tracing" (reconstructing a product's history back to the manufacturer), which are essential for identifying the point of entry for counterfeit drugs (Systech, 2025).

### 2.2 Theoretical Review

This research is guided by two primary theories:

- **Theory of Constraints (TOC):** Postulated by Eliyahu Goldratt, TOC suggests that every goal-oriented system has at least one constraint that limits its output (Shashi, 2023). In the Nigerian drug market, the primary "constraint" is the inability of consumers to access the official NAFDAC registry in real-time. By digitalizing this access via a web app, the project addresses this system bottleneck to improve public health outcomes (Mosby, 2025; Shashi, 2023).

- **Institutional Theory:** This theory explores how external regulatory pressures (e.g., NAFDAC mandates) shape the behavior of pharmaceutical organizations. Effective traceability systems are often a response to these institutional pressures rather than voluntary adoption, highlighting the need for systems that align with government regulatory frameworks like the Nigerian Green Book (Prathama et al., 2024; Zainuddin, 2020).

### 2.3 Review of Related Works

#### 2.3.1 DuBoTeSS Pharma-Chain via Enhanced Blockchain (Ejeh et al., 2024)

These researchers proposed a decentralized tracer-support system using Hyperledger Fabric for the Nigerian market. Their system demonstrated a high performance of 1,138 transactions per second (TPS) and used QR codes with 3-layered security (ultraviolet inks and scrambled images). This work is significant because it provides a roadmap for NAFDAC to ensure pharmaceutical transparency, though it notes that response time increases slightly as the user load grows.

#### 2.3.2 MediVerify CNN and Blockchain Fusion (Roy et al., 2024)

Roy et al. developed an integrated approach that combines pill image recognition via Convolutional Neural Networks (CNN) with a blockchain ledger for verification. This system ensures that both the packaging and the actual chemical content (via visual cues) are authentic. This study justifies why the "Smart Drug Check" should eventually move toward visual pill identification to supplement database cross-referencing.

#### 2.3.3 AI-Based Counterfeit Detection in Nigeria (Edegbe & Tone, 2025)

Focusing specifically on the Nigerian drug market, these authors developed a web application using YOLO-NAS for logo detection and OCR for text extraction. They achieved an overall mAP of 79.3% in recognizing approved manufacturer logos. This research highlights the effectiveness of using AI to validate NAFDAC-approved brands directly through a consumer's smartphone camera.

#### 2.3.4 Blockchain with Polymorphic Encryption (Famous et al., 2025)

Famous et al. proposed a robust framework using Ethereum blockchain integrated with polymorphic encryption to protect the privacy of drug transactions. Their experimental results showed that this approach surpassed existing systems in terms of data security and traceability. However, they identified that inheriting Ethereum's gas costs could be a limitation for high-frequency consumer checks in low-income regions.

#### 2.3.5 Product Identification via Cryptographic Hashing (Sharma et al., 2025)

This study proposed a model where each drug package is assigned a unique hash code recorded on an immutable blockchain. By using QR code scanning, stakeholders can verify a drug's entire journey almost instantly. This work emphasizes the "discard" mechanism, where once a unit is verified as genuine and dispensed, its ID is removed from the active pool to prevent packaging reuse.

#### 2.3.6 Ethereum Smart Contracts for Automated Governance (Said et al., 2023)

Said et al. demonstrated a system that uses Solidity-based smart contracts to automate the verification of drug transfers. In controlled testing with 50 products, the system achieved 100% accuracy. This research justifies the use of automated logic (smart contracts) to reduce human error and speed up the authentication of drug transfers across the supply chain.

#### 2.3.7 Medicine Counterfeiting Use Case Extraction (Islam & Islam, 2024)

These researchers derived use cases for drug authentication by interviewing key supply chain workers in Bangladesh. Their resulting prototype executed blocks in 201 milliseconds, proving that blockchain can be fast enough for real-time retail use. This study provides a methodology for extracting system features based on the actual socio-economic needs of the users.

#### 2.3.8 Dual Consensus Protocols for Transparency (Shivale et al., 2025)

Shivale et al. introduced a blockchain solution that uses both Proof of Work (PoW) for high security and Proof of Stake (PoS) for scalability. Their system achieved higher traceability accuracy and faster transaction validation than single-consensus models. This work highlights the trade-off between resource intensity and fairness in decentralized verification systems.

#### 2.3.9 Zero-Knowledge Proofs for Privacy Preservation (Zhang et al., 2025)

Zhang et al. developed "PBTMS," which uses zero-knowledge proofs to allow drug verification without revealing sensitive manufacturer or patient data. Their system achieved a 79.2% faster decryption rate than traditional encrypted databases. This is critical for systems that must comply with the Nigeria Data Protection Act of 2023 while still providing public transparency.

#### 2.3.10 Near-Infrared Spectra ML Prediction (Wei, 2024)

Wei demonstrated that machine learning models can be trained on simulated NIR spectra to identify fake drugs with 93% accuracy, even without a dataset of real counterfeit samples. While technical, this study justifies why chemical "fingerprinting" data should be integrated into high-end professional versions of the Smart Drug Check application.

#### 2.3.11 IoT Temperature and Storage Monitoring (Kumar et al., 2025)

Kumar proposed an IoT-based system to ensure cold-chain integrity during drug transportation. While focused on storage, the study highlights that authentication must also include "environmental safety" (e.g., has a vaccine been stored properly?). This suggests that future drug checks should also cross-reference storage history.

#### 2.3.12 Synthetic Packaging AI Anomaly Detection (Motwani et al., 2022)

Motwani et al. used augmented datasets to train deep learning models on synthetically generated "fake" packaging. This improved the model's ability to generalize and find spelling or font inconsistencies. This justifies the inclusion of OCR and spell-checking functionalities in the Smart Drug Check application's visual layer.

#### 2.3.13 PNN for SQL Injection Attack Detection (Al-Farsi et al., 2021)

These researchers explored the security of supply chain databases and proposed using Probabilistic Neural Networks (PNN) to detect SQL injection attacks. Their model achieved 99.19% accuracy. This work is significant because it highlights the necessity of securing the web interface of any drug verification system against data-poisoning attacks.

#### 2.3.14 Decentralized Ledger and QR Scanning (Alam et al., 2021)

Alam et al. explained how placing product information in a blockchain-backed QR code gives consumers immediate feedback without relying on a central database server. This work emphasizes the "User Interface" aspect of verification, ensuring that feedback is provided in seconds to maintain user engagement at the point of purchase.

#### 2.3.15 MITM Attack Prevention in Identity Management (Raich & Gadicha, 2024)

This study analyzed vulnerabilities in standard authentication protocols like SSL/TLS and proposed blockchain-enhanced protocols to prevent Man-in-the-Middle (MITM) attacks. Their findings suggest a paradigm shift in how we secure communication channels between the user's smartphone and the NAFDAC database.

### 2.4 Table of Summary of Related Works

| Author/Year | Title | Method Used | Dataset/Tools | Findings | Limitation |
|---|---|---|---|---|---|
| Ejeh (2024) | DuBoTeSS Nigeria | Blockchain | Hyperledger | 1,138 TPS; 88s retrieval. | Latency grows with load. |
| Roy (2024) | MediVerify | CNN / BC | Pill Images | Integrated content/pack check. | Requires high-res pill cams. |
| Edegbe (2025) | AI Logo Detection | Computer Vision | YOLO-NAS | 79.3% mAP in logo detection. | Struggles with low light. |
| Famous (2025) | BC SCM App | Polymorphic Encr | Ethereum | Surpassed current security. | Inherits ETH gas fees. |
| Sharma (2025) | Hash Identification | Cryptographic | QR / Blockchain | Immutability prevents reuse. | High mobile compute needs. |
| Said (2023) | BC Authentication | Smart Contracts | Solidity | 100% accuracy in tests. | Limited sample size (50). |
| Islam (2024) | Counterfeit BC | Use Case Analysis | Bangladesh | Blocks in 201 ms. | Context-specific features. |
| Shivale (2025) | Dual Consensus | PoW and PoS | BC Network | Balanced security/scale. | PoW is resource-heavy. |
| Zhang (2025) | PBTMS Privacy | ZK Proofs | Commitments | 79.2% faster decryption. | High implementation complexity. |
| Wei (2024) | NIR Spectra ML | ML Prediction | Simulated Data | 93% accuracy on composition. | Needs spectral hardware. |
| Kumar (2025) | IoT Monitoring | Sensors | IoT / Queries | Ensured cold-chain integrity. | Focuses on storage, not registry. |
| Motwani (2022) | Synthetic Packaging | Deep Learning | Augmented | Better model generalization. | Synthetic data diffs. |
| Al-Farsi (2021) | Security Analysis | PNN Logic | 9,500 Queries | 99.19% SQLi detection. | High training time. |
| Alam (2021) | QR Authentication | Scanning | BC Ledger | Real-time user verification. | Vulnerable to QR copies. |
| Raich (2024) | MITM Prevention | Identity Mgmt | BC Protocols | Secure comms vs attacks. | High protocol overhead. |

### 2.5 Summary of Reviewed Literature and Gaps

The review indicates a strong shift from manual visual inspection toward Blockchain (BC) for data immutability and AI/Computer Vision for automated label verification. While these advanced systems achieve accuracy rates up to 99.5%, they present several significant gaps in the Nigerian context:

- **Infrastructure Gap:** Most blockchain and AI models require high bandwidth and high-end hardware (e.g., scanners or 4K cameras) which are not accessible to the 70% of Nigerians living below the poverty line (Mosby, 2025; Otte et al., 2015).

- **Implementation Complexity:** High transaction fees (Gas) on Ethereum and the complexity of zero-knowledge proofs make many solutions cost-prohibitive for government scaling.

- **Data Bridging Gap:** There is a lack of a lightweight, web-accessible tool specifically designed to bridge the Nigerian NAFDAC Green Book database with the general public. Existing research often focuses on theoretical blockchains rather than the practical integration of the 9,000+ existing registration records.

The "Smart Drug Check" project fills these gaps by using standard HTTPS web protocols to create a low-data, high-response application that directly cross-references the official NAFDAC registry.

---

## CHAPTER THREE: SYSTEM ANALYSIS AND METHODOLOGY

### 3.1 Analysis of Existing System

The primary existing system for consumer drug verification in Nigeria is the NAFDAC Mobile Authentication Service (MAS), introduced in 2010. It requires manufacturers to affix a scratch-off panel to the drug packaging. The consumer reveals a unique 12-to-13 digit PIN and sends it as an SMS to a shortcode (e.g., 38353 for Sproxil or 1393 for M-Pedigree) (Ayodokun, 2018; NAFDAC, 2018).

#### 3.1.1 Advantages

- **Widespread Accessibility:** Works on basic feature phones without requiring an internet connection.
- **Zero Cost to Consumer:** The SMS services are toll-free, enlisting the public as a "surveillance network" (Ayodokun, 2018).
- **Immediate Binary Feedback:** Provides a simple "Genuine" or "Fake" response for quick decision-making (NAFDAC, 2018).

#### 3.1.2 Disadvantages

- **Network Latency:** SMS queries are highly susceptible to GSM network congestion; investigations show responses can arrive over 20 minutes late or not at all (Mefor-Nwachukwu, 2026; Wogu et al., 2019).
- **Limited Scope:** The scheme is mandatory only for antimalarials and antibiotics, leaving over 11,000 other registered products unprotected (NAFDAC, 2018).
- **Information Scarcity:** It does not provide the product's image, approval date, or full manufacturer history, which are often needed to build consumer trust (Oketa et al., 2019).

### 3.2 Analysis of the New System

The "Smart Drug Check" is a web-based system designed as an interface to the NAFDAC Green Book database. Users can input the NAFDAC Registration Number (NRN) or scan a barcode via a browser-based camera API. The system then queries the central registry in real-time.

#### 3.2.1 Justification for the New System

The new system is justified by its ability to provide a "single source of truth." By bypassing the intermediate MAS providers, the web app can pull comprehensive data fields directly from the NAFDAC portal, including:

- Product Strength and Dosage Form.
- Applicant Name and Address.
- Active Ingredients and Approval Date.
- Current Registration Status (Active/Inactive).

This data-rich environment makes it significantly harder for counterfeiters to mislead consumers with cloned registration numbers.

### 3.3 Methodology Adopted

This project adopts the **Agile Software Development Methodology**. Agile is chosen because it is iterative and allows for constant feedback loops during development. As a professional developer, I recognize that regulatory portals like NAFDAC's frequently update their structures, and Agile provides the necessary flexibility to adapt the system's integration logic without starting from scratch.

**Why Agile?**

- **Flexibility:** If NAFDAC modifies the data fields in the Green Book halfway through the project, Agile allows me to adjust the scraper/query logic immediately during the next "Sprint."
- **User Involvement:** At the end of each 2-week cycle, a "demo" of the UI can be shown to stakeholders (e.g., pharmacists) to ensure the workflow matches their actual practice in the pharmacy.
- **Speed to Market:** It allows for the launch of the most critical feature (the NRN search) while still working on the more complex OCR and image recognition modules.

### 3.4 High-Level Model

#### 3.4.1 Block Diagram

The Block Diagram represents the structural flow:

- **Input Block:** Manual text entry of NRN or camera-based barcode scan.
- **Processing Block:** Python/Django middleware handling input sanitization and query execution.
- **External Integration Block:** The web connection to the NAFDAC Registered Products Database.
- **Output Block:** Rendering of JSON data into a readable authentication card for the user.

#### 3.4.2 Architecture Diagram

The system uses a professional **3-Tier Architecture**:

- **Presentation Layer:** A responsive web frontend built with React.js or HTML5/CSS3.
- **Logic Layer:** A Python-based Django server hosting the authentication and reporting modules.
- **Data Layer:** A combination of a local SQLite database (for verification logs) and the remote NAFDAC Green Book registry.

#### 3.4.3 Use Case Diagram

- **User Actor:** "Search Drug by NRN," "Scan Barcode," "View Verification Report."
- **Admin Actor:** "Manage User Accounts," "View Failed Scan Analytics," "Update Registry Cache."
- **System Actor:** "Validate Input Format," "Query External DB," "Log Failed Attempt."

### 3.5 Specifications

#### 3.5.1 Program Module Specification

- **Verification Module:** The core engine that processes queries and determines the authenticity status.
- **Image Processing Module:** Handles camera API integration and QR/Barcode decoding.
- **Surveillance Module:** Automatically flags and stores metadata (location, timestamp) for failed authentications.

#### 3.5.2 Database Design (ER Diagram)

**Entities:**

- **User:** (id, username, email, password_hash)
- **Verification_Log:** (log_id, user_id, nrn_queried, status, timestamp, geolocation)
- **Registry_Cache:** (nrn, product_name, manufacturer, expiry_date, active_status)

#### 3.5.3 Input/Output Design

**Input:** Users enter an alphanumeric NRN or capture a 2D barcode via the device camera.

**Output:** An authentication card displaying: "STATUS: GENUINE" (Green) or "STATUS: UNKNOWN/FAKE" (Red), along with the registered drug name and manufacturer details.

#### 3.5.4 Data Dictionary

| Field Name | Data Type | Description |
|---|---|---|
| nrn | VARCHAR(20) | Unique NAFDAC Registration Number. |
| product_name | VARCHAR(100) | Brand name of the medication. |
| manufacturer | VARCHAR(150) | The company registered as the maker. |
| status | BOOLEAN | Indicates if the drug is currently approved. |

#### 3.5.5 Algorithms (Pseudocode)

```
BEGIN
  GET input_nrn FROM Web_UI
  SANITIZE input_nrn (REMOVE SPECIAL_CHARS)
  CALL verify_nrn_api(input_nrn)
  IF response_code == 200 THEN
    PARSE response_data (name, manufacturer, approval_date)
    DISPLAY "Authentic" AND mapped_details
  ELSE
    DISPLAY "Suspected Counterfeit / Not in Database"
    LOG incident(input_nrn, timestamp, user_location)
  ENDIF
END
```

#### 3.5.6 Evaluation of Security (SQLi Detection)

A system querying a government-linked database is a high-value target for SQL injection attacks, which have increased by 300% recently (Al-Farsi et al., 2021). The system will implement a query-validation logic with the accuracy defined by:

**Accuracy = (TP + TN) / (TP + TN + FP + FN)**

where TP is True Positives and TN is True Negatives (Al-Farsi et al., 2021).

### 3.6 System Flowchart

*(See original document for flowchart diagram)*

---

## REFERENCES

- Adigwe, O., et al. (2022). Knowledge and practices of Nigerian pharmacists towards detection of counterfeit medical products. *Journal of Pharmaceutical Policy and Practice*, 15(1).

- Al-Farsi, S., Rathore, M. M., & Bakiras, S. (2021). Security of blockchain-based supply chain management systems: Challenges and opportunities. *Applied Sciences*, 11(12), 5585. https://doi.org/10.3390/app11125585

- Al-Farsi, S., et al. (2023). Enhancing the performance of SQL injection attack detection through Probabilistic Neural Networks. *Journal of Cybersecurity Research*, 13(7), 4365.

- Alam, N. (2021). QR code-based pharmaceutical authentication system using blockchain technology. *International Journal of Advanced Research in Computer Science*, 12(4), 18–24.

- Ayodokun, J. (2018). The identification of drugs through Mobile Authentication Service (MAS) in Nigeria. IFRA-Nigeria. https://ifra-nigeria.org/files/44/Habitele/22/Joseph-Ayodokun:-Identification-drugs-MAS.pdf

- Chika, P., & Onwuka, E. (2020). Designing a computerized drug and food authentication system in Nigeria. *IDOSR Journal of Computer and Applied Sciences*, 5(1), 28–42.

- Edegbe, G. N., & Tone, M. C. (2025). Development of an AI-based application for counterfeit medicine detection in the Nigerian drug market. *International Journal of Innovative Computing*, 15(1), 17–27. https://doi.org/10.11113/ijic.v15n1.486

- Ejeh, P. O., Ojugo, A. A., & Otakore, O. E. (2024). Counterfeit drugs detection in the Nigeria pharma-chain via enhanced blockchain-based mobile authentication service. *Journal of Advances in Mathematical & Computational Sciences*, 12(2), 25–34.

- Ewanlen, D. O., & Aigbiremolen, A. A. (2025). Counterfeit drugs epidemic in Nigeria: Consumers' who can save you. *International Journal of Economics, Business and Management*, 1(2), 557–569. https://doi.org/10.59568/IJEBM-2025-1-2-38

- Famous, M. S., Sayed, S., Mazumder, R., Khan, R. T., Kaiser, M. S., Hossain, M. S., Andersson, K., & Khondoker, R. (2025). Leveraging blockchain, polymorphic encryption and cloud storage for secure medication supply chain management. *Computer Science and Application*. https://doi.org/10.1016/j.csa.2025.100103

- Islam, S., & Islam, M. (2024). Medicine counterfeiting prevention using blockchain technology: Use case extraction and prototype development. *Cogent Business & Management*, 11(1), 2331197.

- Kumar, M. (2024). Pharmaceutical serialization dynamics to restrain illicit trade and counterfeiting of drugs. *World Journal of Advanced Research and Reviews*, 22(2), 913–918. https://doi.org/10.30574/wjarr.2024.22.2.1461

- Mefor-Nwachukwu, C. (2026, February 9). NAFDAC's Mobile Authentication Service in decline. *The Whistler*. https://thewhistler.ng/nafdacs-mobile-authentication-service-in-decline/

- Mosby, C. E. (2025). Strategies to eliminate counterfeit medications in the pharmaceutical supply chain. ScholarWorks.

- National Agency for Food and Drug Administration and Control. (2025). NAFDAC Green Book: Registered product database. http://greenbook.nafdac.gov.ng/

- Oketa, K. C., Alo, U. R., Okemiri, H., & Praise, M. (2019). Computerized Drug Verification System (CDVS). *International Journal of Advanced Computer Science and Applications*, 10(11). https://doi.org/10.14569/IJACSA.2019.0101115

- Said, A. G., Gawali, T., Chavan, M., Bendgude, S., & Hande, R. (2023). Fake drug detection using blockchain technology. *International Journal for Research in Applied Science and Engineering Technology*, 11(5), 4303–4307. https://doi.org/10.22214/ijraset.2023.52290

- Sharma, D., et al. (2025). Blockchain and QR code-based product identification system to prevent the circulation of fake medical products. *EVERGREEN Joint Journal of Novel Carbon Resource Sciences & Green Asia Strategy*, 12(4), 1827–1839.

- Shashi, M. (2023). Sustainable digitalization in pharmaceutical supply chains using theory of constraints: A qualitative study. *Sustainability*, 15(11), 8752. https://doi.org/10.3390/su15118752

- World Health Organization. (2017). WHO global surveillance and monitoring system for substandard and falsified medical products. https://www.who.int/publications/i/item/9789241513425

- Zainuddin, M. (2020). Supply chain traceability: An institutional theory perspective. *Journal of Science and Technology Policy Management*.

- Zhang, R., Li, Y., & Fang, L. (2025). PBTMS: A blockchain-based privacy-preserving system for reliable and efficient e-commerce. *Electronics*, 14(6), 1177. https://doi.org/10.3390/electronics14061177
