import json
import random
from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta

# Create a Blueprint for the LinkedIn-style API
linkedin_bp = Blueprint('linkedin', __name__, url_prefix='/linkedin')

# Create a dummy database of candidates
candidates = [
    {
        "id": 101,
        "name": "Alex Chen",
        "contact": "alex.c@example.com",
        "phone": "+1-555-123-4567",
        "current_role": "Software Developer",
        "experience_years": 4,
        "skills": ["Python", "Django", "AWS", "Agile methodologies"],
        "education": ["BS Computer Science"],
        "certifications": ["AWS Certified"],
        "location_preference": ["Remote", "Boston"],
        "salary_expectation": 90000,
        "availability": "2 weeks notice",
        "languages": ["English", "Mandarin"],
        "last_updated": (datetime.now() - timedelta(days=5)).isoformat()
    },
    {
        "id": 102,
        "name": "Jordan Smith",
        "contact": "j.smith@example.com",
        "phone": "+1-555-987-6543",
        "current_role": "Senior Data Scientist",
        "experience_years": 7,
        "skills": ["Python", "Machine Learning", "TensorFlow", "SQL", "Data Visualization"],
        "education": ["MS Data Science", "BS Statistics"],
        "certifications": ["Google Data Analytics Professional Certificate"],
        "location_preference": ["Remote", "New York"],
        "salary_expectation": 120000,
        "availability": "Immediately",
        "languages": ["English", "Spanish"],
        "last_updated": (datetime.now() - timedelta(days=2)).isoformat()
    },
    {
        "id": 103,
        "name": "Taylor Williams",
        "contact": "taylor.w@example.com",
        "phone": "+1-555-456-7890",
        "current_role": "Frontend Developer",
        "experience_years": 3,
        "skills": ["JavaScript", "React", "HTML", "CSS", "UI/UX Design"],
        "education": ["BS Computer Science"],
        "certifications": ["Meta Frontend Developer Professional Certificate"],
        "location_preference": ["San Francisco", "Los Angeles"],
        "salary_expectation": 85000,
        "availability": "1 month notice",
        "languages": ["English"],
        "last_updated": (datetime.now() - timedelta(days=10)).isoformat()
    },
    {
        "id": 104,
        "name": "Morgan Lee",
        "contact": "morgan.l@example.com",
        "phone": "+1-555-222-3333",
        "current_role": "DevOps Engineer",
        "experience_years": 5,
        "skills": ["Docker", "Kubernetes", "CI/CD", "AWS", "Terraform", "Python"],
        "education": ["BS Software Engineering"],
        "certifications": ["AWS DevOps Professional", "Kubernetes Administrator"],
        "location_preference": ["Remote", "Seattle"],
        "salary_expectation": 110000,
        "availability": "2 weeks notice",
        "languages": ["English", "Korean"],
        "last_updated": (datetime.now() - timedelta(days=7)).isoformat()
    },
    {
        "id": 105,
        "name": "Casey Martinez",
        "contact": "casey.m@example.com",
        "phone": "+1-555-888-9999",
        "current_role": "Product Manager",
        "experience_years": 6,
        "skills": ["Product Strategy", "User Research", "Agile", "Roadmapping", "Stakeholder Management"],
        "education": ["MBA", "BS Business Administration"],
        "certifications": ["Professional Scrum Product Owner"],
        "location_preference": ["Remote", "Chicago", "Austin"],
        "salary_expectation": 115000,
        "availability": "1 month notice",
        "languages": ["English", "Spanish", "Portuguese"],
        "last_updated": (datetime.now() - timedelta(days=15)).isoformat()
    },
    {
        "id": 106,
        "name": "Riley Thompson",
        "contact": "riley.t@example.com",
        "phone": "+1-555-777-1111",
        "current_role": "UX Researcher",
        "experience_years": 4,
        "skills": ["User Research", "Usability Testing", "Design Thinking", "Data Analysis", "Prototyping"],
        "education": ["MS Human-Computer Interaction", "BA Psychology"],
        "certifications": ["UX Research Certification"],
        "location_preference": ["Remote", "Portland", "Seattle"],
        "salary_expectation": 95000,
        "availability": "Immediately",
        "languages": ["English", "French"],
        "last_updated": (datetime.now() - timedelta(days=3)).isoformat()
    },
    {
        "id": 107,
        "name": "Avery Johnson",
        "contact": "avery.j@example.com",
        "phone": "+1-555-444-5555",
        "current_role": "Backend Engineer",
        "experience_years": 5,
        "skills": ["Java", "Spring Boot", "Microservices", "SQL", "NoSQL", "API Design"],
        "education": ["BS Computer Engineering"],
        "certifications": ["Oracle Certified Professional Java Programmer"],
        "location_preference": ["Atlanta", "Remote"],
        "salary_expectation": 105000,
        "availability": "3 weeks notice",
        "languages": ["English"],
        "last_updated": (datetime.now() - timedelta(days=20)).isoformat()
    },
    {
        "id": 108,
        "name": "Quinn Peters",
        "contact": "quinn.p@example.com",
        "phone": "+1-555-666-7777",
        "current_role": "Data Engineer",
        "experience_years": 3,
        "skills": ["Python", "Spark", "Hadoop", "SQL", "ETL", "Data Warehousing"],
        "education": ["MS Information Systems", "BS Computer Science"],
        "certifications": ["Google Cloud Professional Data Engineer"],
        "location_preference": ["Remote", "Denver"],
        "salary_expectation": 100000,
        "availability": "2 weeks notice",
        "languages": ["English", "German"],
        "last_updated": (datetime.now() - timedelta(days=12)).isoformat()
    },
    {
        "id": 109,
        "name": "Jamie Rodriguez",
        "contact": "jamie.r@example.com",
        "phone": "+1-555-999-8888",
        "current_role": "Full Stack Developer",
        "experience_years": 6,
        "skills": ["JavaScript", "Node.js", "React", "MongoDB", "Express", "Python", "Django"],
        "education": ["BS Software Development"],
        "certifications": ["MongoDB Developer"],
        "location_preference": ["Miami", "Remote"],
        "salary_expectation": 110000,
        "availability": "1 month notice",
        "languages": ["English", "Spanish"],
        "last_updated": (datetime.now() - timedelta(days=8)).isoformat()
    },
    {
        "id": 110,
        "name": "Dakota Kim",
        "contact": "dakota.k@example.com",
        "phone": "+1-555-333-2222",
        "current_role": "Cybersecurity Analyst",
        "experience_years": 4,
        "skills": ["Network Security", "Penetration Testing", "SIEM", "Risk Assessment", "Compliance"],
        "education": ["BS Cybersecurity"],
        "certifications": ["Certified Ethical Hacker", "CompTIA Security+"],
        "location_preference": ["Remote", "Washington DC"],
        "salary_expectation": 95000,
        "availability": "Immediately",
        "languages": ["English", "Korean"],
        "last_updated": (datetime.now() - timedelta(days=1)).isoformat()
    },
    {
        "id": 111,
        "name": "Arjun Patel",
        "contact": "arjun.patel@example.com",
        "phone": "+91-9876543210",
        "current_role": "Senior Full Stack Developer",
        "experience_years": 6,
        "skills": ["React", "Node.js", "MongoDB", "Express", "AWS", "TypeScript"],
        "education": ["B.Tech Computer Science, IIT Bombay"],
        "certifications": ["AWS Certified Developer", "MongoDB Professional"],
        "location_preference": ["Bangalore", "Remote", "Pune"],
        "salary_expectation": 2400000,  # In INR
        "availability": "1 month notice",
        "languages": ["English", "Hindi", "Gujarati"],
        "last_updated": (datetime.now() - timedelta(days=3)).isoformat()
    },
    {
        "id": 112,
        "name": "Priya Sharma",
        "contact": "priya.s@example.com",
        "phone": "+91-8765432109",
        "current_role": "Data Scientist",
        "experience_years": 4,
        "skills": ["Python", "Machine Learning", "TensorFlow", "SQL", "Data Visualization", "R"],
        "education": ["M.Tech in AI, IISc Bangalore", "B.E. Computer Engineering, Delhi University"],
        "certifications": ["IBM Data Science Professional Certificate", "Google TensorFlow Developer"],
        "location_preference": ["Delhi", "Gurgaon", "Remote"],
        "salary_expectation": 1800000,  # In INR
        "availability": "2 weeks notice",
        "languages": ["English", "Hindi", "Bengali"],
        "last_updated": (datetime.now() - timedelta(days=5)).isoformat()
    },
    {
        "id": 113,
        "name": "Vikram Iyer",
        "contact": "vikram.i@example.com",
        "phone": "+91-7654321098",
        "current_role": "DevOps Engineer",
        "experience_years": 7,
        "skills": ["Kubernetes", "Docker", "AWS", "Terraform", "CI/CD", "Jenkins", "Python"],
        "education": ["B.Tech in Computer Science, VIT Vellore"],
        "certifications": ["Certified Kubernetes Administrator", "AWS DevOps Professional"],
        "location_preference": ["Hyderabad", "Bangalore", "Remote"],
        "salary_expectation": 2800000,  # In INR
        "availability": "3 months notice",
        "languages": ["English", "Hindi", "Telugu", "Tamil"],
        "last_updated": (datetime.now() - timedelta(days=10)).isoformat()
    },
    {
        "id": 114,
        "name": "Neha Reddy",
        "contact": "neha.r@example.com",
        "phone": "+91-6543210987",
        "current_role": "Product Manager",
        "experience_years": 5,
        "skills": ["Product Strategy", "Agile", "User Research", "Market Analysis", "JIRA", "Roadmapping"],
        "education": ["MBA IIM Ahmedabad", "B.Tech Electronics, BITS Pilani"],
        "certifications": ["Certified Scrum Product Owner", "Product Management Certification"],
        "location_preference": ["Mumbai", "Pune", "Remote"],
        "salary_expectation": 2200000,  # In INR
        "availability": "2 months notice",
        "languages": ["English", "Hindi", "Marathi"],
        "last_updated": (datetime.now() - timedelta(days=7)).isoformat()
    },
    {
        "id": 115,
        "name": "Rahul Mehta",
        "contact": "rahul.m@example.com",
        "phone": "+91-9876543211",
        "current_role": "UI/UX Designer",
        "experience_years": 3,
        "skills": ["Figma", "Adobe XD", "User Research", "Wireframing", "Prototyping", "HTML/CSS"],
        "education": ["Masters in Design, NID Ahmedabad"],
        "certifications": ["Google UX Design Professional Certificate"],
        "location_preference": ["Bangalore", "Chennai", "Remote"],
        "salary_expectation": 1500000,  # In INR
        "availability": "Immediately",
        "languages": ["English", "Hindi", "Kannada"],
        "last_updated": (datetime.now() - timedelta(days=2)).isoformat()
    },
    {
        "id": 201,
        "name": "Aditya Sharma",
        "contact": "aditya.s@example.com",
        "phone": "+91-789-456-1230",
        "current_role": "Backend Developer",
        "experience_years": 3,
        "skills": ["Java", "Spring Boot", "MongoDB", "Microservices"],
        "education": ["B.Tech Computer Science"],
        "certifications": ["Oracle Certified Java Programmer"],
        "location_preference": ["Bangalore", "Remote"],
        "salary_expectation": 1500000,
        "availability": "1 month notice",
        "languages": ["English", "Hindi", "Kannada"],
        "last_updated": (datetime.now() - timedelta(days=7)).isoformat()
    },
    {
        "id": 202,
        "name": "Priya Patel",
        "contact": "priya.p@example.com",
        "phone": "+91-987-654-3210",
        "current_role": "Frontend Developer",
        "experience_years": 2,
        "skills": ["JavaScript", "React", "CSS", "HTML5", "Bootstrap"],
        "education": ["B.E. Information Technology"],
        "certifications": ["Meta Front-End Developer Certificate"],
        "location_preference": ["Mumbai", "Pune", "Remote"],
        "salary_expectation": 1200000,
        "availability": "2 weeks notice",
        "languages": ["English", "Hindi", "Gujarati", "Marathi"],
        "last_updated": (datetime.now() - timedelta(days=3)).isoformat()
    },
    {
        "id": 203,
        "name": "Vikram Reddy",
        "contact": "vikram.r@example.com",
        "phone": "+91-876-543-2109",
        "current_role": "DevOps Engineer",
        "experience_years": 5,
        "skills": ["Docker", "Kubernetes", "AWS", "Jenkins", "Terraform", "Linux"],
        "education": ["M.Tech Cloud Computing", "B.Tech Electronics"],
        "certifications": ["AWS DevOps Professional", "Certified Kubernetes Administrator"],
        "location_preference": ["Hyderabad", "Remote"],
        "salary_expectation": 2000000,
        "availability": "45 days notice",
        "languages": ["English", "Hindi", "Telugu"],
        "last_updated": (datetime.now() - timedelta(days=10)).isoformat()
    },
    {
        "id": 204,
        "name": "Neha Gupta",
        "contact": "neha.g@example.com",
        "phone": "+91-765-432-1098",
        "current_role": "UI/UX Designer",
        "experience_years": 4,
        "skills": ["Figma", "Adobe XD", "Sketch", "Wireframing", "User Research"],
        "education": ["B.Des. Design", "Diploma in UX Research"],
        "certifications": ["Google UX Design Certificate"],
        "location_preference": ["Bangalore", "Remote"],
        "salary_expectation": 1800000,
        "availability": "1 month notice",
        "languages": ["English", "Hindi", "Bengali"],
        "last_updated": (datetime.now() - timedelta(days=5)).isoformat()
    },
    {
        "id": 205,
        "name": "Rajesh Kumar",
        "contact": "rajesh.k@example.com",
        "phone": "+91-654-321-0987",
        "current_role": "Data Engineer",
        "experience_years": 6,
        "skills": ["Python", "Spark", "Hadoop", "SQL", "Azure Databricks", "ETL"],
        "education": ["M.Tech Data Science", "B.Tech Computer Science"],
        "certifications": ["Microsoft Certified: Azure Data Engineer Associate"],
        "location_preference": ["Pune", "Bangalore", "Remote"],
        "salary_expectation": 2200000,
        "availability": "2 months notice",
        "languages": ["English", "Hindi", "Tamil"],
        "last_updated": (datetime.now() - timedelta(days=15)).isoformat()
    },
    {
        "id": 206,
        "name": "Ananya Singh",
        "contact": "ananya.s@example.com",
        "phone": "+91-543-210-9876",
        "current_role": "Product Manager",
        "experience_years": 7,
        "skills": ["Product Strategy", "Agile", "Jira", "Market Research", "User Stories"],
        "education": ["MBA Product Management", "B.Tech Computer Science"],
        "certifications": ["Certified Scrum Product Owner", "Product Management Certificate"],
        "location_preference": ["Delhi NCR", "Remote"],
        "salary_expectation": 2500000,
        "availability": "3 months notice",
        "languages": ["English", "Hindi", "Punjabi"],
        "last_updated": (datetime.now() - timedelta(days=20)).isoformat()
    },
    {
        "id": 207,
        "name": "Sanjay Verma",
        "contact": "sanjay.v@example.com",
        "phone": "+91-432-109-8765",
        "current_role": "Full Stack Developer",
        "experience_years": 4,
        "skills": ["MERN Stack", "MongoDB", "Express", "React", "Node.js", "TypeScript"],
        "education": ["B.Tech Information Technology"],
        "certifications": ["MongoDB Certified Developer"],
        "location_preference": ["Bangalore", "Chennai", "Remote"],
        "salary_expectation": 1700000,
        "availability": "45 days notice",
        "languages": ["English", "Hindi", "Malayalam"],
        "last_updated": (datetime.now() - timedelta(days=8)).isoformat()
    },
    {
        "id": 208,
        "name": "Kavita Joshi",
        "contact": "kavita.j@example.com",
        "phone": "+91-321-098-7654",
        "current_role": "Quality Assurance Engineer",
        "experience_years": 3,
        "skills": ["Manual Testing", "Selenium", "JUnit", "TestNG", "JIRA", "Jenkins"],
        "education": ["B.E. Computer Engineering"],
        "certifications": ["ISTQB Foundation Level"],
        "location_preference": ["Chennai", "Remote"],
        "salary_expectation": 1300000,
        "availability": "1 month notice",
        "languages": ["English", "Hindi", "Tamil"],
        "last_updated": (datetime.now() - timedelta(days=12)).isoformat()
    },
    {
        "id": 209,
        "name": "Arjun Nair",
        "contact": "arjun.n@example.com",
        "phone": "+91-210-987-6543",
        "current_role": "Machine Learning Engineer",
        "experience_years": 5,
        "skills": ["Python", "TensorFlow", "PyTorch", "NLP", "Computer Vision", "MLOps"],
        "education": ["M.Tech Artificial Intelligence", "B.Tech Electronics"],
        "certifications": ["TensorFlow Developer Certificate", "AWS Machine Learning Specialty"],
        "location_preference": ["Hyderabad", "Bangalore", "Remote"],
        "salary_expectation": 2100000,
        "availability": "2 months notice",
        "languages": ["English", "Hindi", "Malayalam"],
        "last_updated": (datetime.now() - timedelta(days=6)).isoformat()
    },
    {
        "id": 210,
        "name": "Meera Rao",
        "contact": "meera.r@example.com",
        "phone": "+91-109-876-5432",
        "current_role": "Cybersecurity Analyst",
        "experience_years": 8,
        "skills": ["Network Security", "Penetration Testing", "SIEM", "Security Auditing", "ISO 27001"],
        "education": ["M.Tech Information Security", "B.Tech Computer Science"],
        "certifications": ["CISSP", "CEH", "CompTIA Security+"],
        "location_preference": ["Bangalore", "Pune", "Remote"],
        "salary_expectation": 2600000,
        "availability": "3 months notice",
        "languages": ["English", "Hindi", "Telugu", "Kannada"],
        "last_updated": (datetime.now() - timedelta(days=18)).isoformat()
    },
    {
        "id": 211,
        "name": "Rahul Mehta",
        "contact": "rahul.m@example.com",
        "phone": "+91-098-765-4321",
        "current_role": "Mobile App Developer",
        "experience_years": 3,
        "skills": ["Flutter", "Dart", "Firebase", "iOS", "Android", "React Native"],
        "education": ["B.Tech Computer Science"],
        "certifications": ["Google Associate Android Developer"],
        "location_preference": ["Mumbai", "Remote"],
        "salary_expectation": 1400000,
        "availability": "1 month notice",
        "languages": ["English", "Hindi", "Marathi"],
        "last_updated": (datetime.now() - timedelta(days=9)).isoformat()
    },
    {
        "id": 212,
        "name": "Sunita Desai",
        "contact": "sunita.d@example.com",
        "phone": "+91-987-654-3211",
        "current_role": "Business Analyst",
        "experience_years": 6,
        "skills": ["Requirements Gathering", "SQL", "Data Analysis", "Process Mapping", "Stakeholder Management"],
        "education": ["MBA Business Analytics", "B.Com"],
        "certifications": ["IIBA ECBA", "CBAP"],
        "location_preference": ["Pune", "Mumbai", "Remote"],
        "salary_expectation": 1900000,
        "availability": "45 days notice",
        "languages": ["English", "Hindi", "Marathi", "Gujarati"],
        "last_updated": (datetime.now() - timedelta(days=14)).isoformat()
    },
    {
        "id": 213,
        "name": "Karthik Iyer",
        "contact": "karthik.i@example.com",
        "phone": "+91-876-543-2108",
        "current_role": "Cloud Solutions Architect",
        "experience_years": 9,
        "skills": ["AWS", "Azure", "GCP", "Terraform", "CloudFormation", "Serverless"],
        "education": ["M.Tech Cloud Computing", "B.E. Computer Science"],
        "certifications": ["AWS Solutions Architect Professional", "Microsoft Azure Solutions Architect"],
        "location_preference": ["Bangalore", "Hyderabad", "Remote"],
        "salary_expectation": 3000000,
        "availability": "3 months notice",
        "languages": ["English", "Hindi", "Tamil", "Kannada"],
        "last_updated": (datetime.now() - timedelta(days=22)).isoformat()
    },
    {
        "id": 214,
        "name": "Divya Malhotra",
        "contact": "divya.m@example.com",
        "phone": "+91-765-432-1097",
        "current_role": "Data Scientist",
        "experience_years": 4,
        "skills": ["Python", "R", "SQL", "Machine Learning", "Statistical Analysis", "Power BI"],
        "education": ["M.Sc. Statistics", "B.Sc. Mathematics"],
        "certifications": ["Microsoft Certified: Data Analyst Associate"],
        "location_preference": ["Delhi NCR", "Remote"],
        "salary_expectation": 1800000,
        "availability": "2 months notice",
        "languages": ["English", "Hindi", "Punjabi"],
        "last_updated": (datetime.now() - timedelta(days=11)).isoformat()
    },
    {
        "id": 215,
        "name": "Pramod Krishnan",
        "contact": "pramod.k@example.com",
        "phone": "+91-654-321-0986",
        "current_role": "Blockchain Developer",
        "experience_years": 5,
        "skills": ["Solidity", "Smart Contracts", "Ethereum", "Web3.js", "Truffle", "Hardhat"],
        "education": ["B.Tech Computer Science"],
        "certifications": ["Certified Blockchain Developer", "Ethereum Developer Certification"],
        "location_preference": ["Bangalore", "Remote"],
        "salary_expectation": 2200000,
        "availability": "45 days notice",
        "languages": ["English", "Hindi", "Malayalam", "Tamil"],
        "last_updated": (datetime.now() - timedelta(days=16)).isoformat()
    },
    {
        "id": 216,
        "name": "Ritu Sharma",
        "contact": "ritu.s@example.com",
        "phone": "+91-543-210-9875",
        "current_role": "Technical Project Manager",
        "experience_years": 8,
        "skills": ["Agile", "Scrum", "JIRA", "Risk Management", "Stakeholder Management", "MS Project"],
        "education": ["MBA Project Management", "B.Tech Electronics"],
        "certifications": ["PMP", "Certified Scrum Master", "PRINCE2 Practitioner"],
        "location_preference": ["Mumbai", "Pune", "Remote"],
        "salary_expectation": 2700000,
        "availability": "2 months notice",
        "languages": ["English", "Hindi", "Marathi"],
        "last_updated": (datetime.now() - timedelta(days=19)).isoformat()
    },
    {
        "id": 217,
        "name": "Vivek Chauhan",
        "contact": "vivek.c@example.com",
        "phone": "+91-432-109-8764",
        "current_role": "System Administrator",
        "experience_years": 7,
        "skills": ["Linux", "Windows Server", "Shell Scripting", "Active Directory", "Virtualization", "Cloud Infrastructure"],
        "education": ["B.E. Computer Engineering"],
        "certifications": ["Red Hat Certified Engineer", "Microsoft Certified: Azure Administrator"],
        "location_preference": ["Delhi NCR", "Remote"],
        "salary_expectation": 2000000,
        "availability": "45 days notice",
        "languages": ["English", "Hindi"],
        "last_updated": (datetime.now() - timedelta(days=13)).isoformat()
    },
    {
        "id": 218,
        "name": "Shreya Mishra",
        "contact": "shreya.m@example.com",
        "phone": "+91-321-098-7653",
        "current_role": "Content Strategist",
        "experience_years": 5,
        "skills": ["Content Planning", "SEO", "Content Marketing", "Copywriting", "Social Media", "Analytics"],
        "education": ["MBA Marketing", "B.A. English Literature"],
        "certifications": ["Google SEO Certification", "Content Marketing Certification"],
        "location_preference": ["Bangalore", "Remote"],
        "salary_expectation": 1600000,
        "availability": "1 month notice",
        "languages": ["English", "Hindi", "Bengali"],
        "last_updated": (datetime.now() - timedelta(days=4)).isoformat()
    },
    {
        "id": 219,
        "name": "Nitin Agarwal",
        "contact": "nitin.a@example.com",
        "phone": "+91-210-987-6542",
        "current_role": "Database Administrator",
        "experience_years": 6,
        "skills": ["Oracle", "MySQL", "PostgreSQL", "SQL Server", "Database Optimization", "Data Modeling"],
        "education": ["M.Tech Database Systems", "B.Tech Information Technology"],
        "certifications": ["Oracle Certified Professional", "MongoDB Certified DBA"],
        "location_preference": ["Hyderabad", "Bangalore", "Remote"],
        "salary_expectation": 2100000,
        "availability": "2 months notice",
        "languages": ["English", "Hindi", "Telugu"],
        "last_updated": (datetime.now() - timedelta(days=17)).isoformat()
    },
    {
        "id": 220,
        "name": "Pooja Choudhary",
        "contact": "pooja.c@example.com",
        "phone": "+91-109-876-5431",
        "current_role": "IoT Developer",
        "experience_years": 3,
        "skills": ["Embedded Systems", "Arduino", "Raspberry Pi", "C++", "MQTT", "Python"],
        "education": ["B.Tech Electronics and Communication"],
        "certifications": ["IoT Certification by Microsoft"],
        "location_preference": ["Pune", "Remote"],
        "salary_expectation": 1500000,
        "availability": "1 month notice",
        "languages": ["English", "Hindi", "Marathi"],
        "last_updated": (datetime.now() - timedelta(days=8)).isoformat()
    },
    {
        "id": 221,
        "name": "Manish Tiwari",
        "contact": "manish.t@example.com",
        "phone": "+91-098-765-4320",
        "current_role": "AI Researcher",
        "experience_years": 4,
        "skills": ["Deep Learning", "Reinforcement Learning", "Computer Vision", "PyTorch", "Research Methodology"],
        "education": ["Ph.D. Artificial Intelligence", "M.Tech Computer Science", "B.Tech Computer Science"],
        "certifications": ["NVIDIA Deep Learning Institute Certificate"],
        "location_preference": ["Bangalore", "Hyderabad", "Remote"],
        "salary_expectation": 2300000,
        "availability": "3 months notice",
        "languages": ["English", "Hindi"],
        "last_updated": (datetime.now() - timedelta(days=21)).isoformat()
    },
    {
        "id": 222,
        "name": "Geeta Bhalla",
        "contact": "geeta.b@example.com",
        "phone": "+91-987-654-3212",
        "current_role": "Technical Writer",
        "experience_years": 5,
        "skills": ["API Documentation", "Knowledge Base Management", "DITA", "Markdown", "Technical Communication"],
        "education": ["M.A. English", "B.Tech Computer Science"],
        "certifications": ["Certified Professional Technical Communicator"],
        "location_preference": ["Pune", "Bangalore", "Remote"],
        "salary_expectation": 1700000,
        "availability": "45 days notice",
        "languages": ["English", "Hindi", "Marathi", "Punjabi"],
        "last_updated": (datetime.now() - timedelta(days=10)).isoformat()
    },
    {
        "id": 223,
        "name": "Amit Saxena",
        "contact": "amit.s@example.com",
        "phone": "+91-876-543-2107",
        "current_role": "Site Reliability Engineer",
        "experience_years": 7,
        "skills": ["Kubernetes", "Docker", "Prometheus", "Grafana", "CI/CD", "Go", "Python"],
        "education": ["B.Tech Computer Science"],
        "certifications": ["Certified Kubernetes Administrator", "Linux Foundation SRE Certification"],
        "location_preference": ["Bangalore", "Hyderabad", "Remote"],
        "salary_expectation": 2400000,
        "availability": "2 months notice",
        "languages": ["English", "Hindi"],
        "last_updated": (datetime.now() - timedelta(days=9)).isoformat()
    },
    {
        "id": 224,
        "name": "Leela Subramaniam",
        "contact": "leela.s@example.com",
        "phone": "+91-765-432-1096",
        "current_role": "Software Architect",
        "experience_years": 10,
        "skills": ["System Design", "Microservices", "Domain-Driven Design", "Java", "Spring", "AWS"],
        "education": ["M.Tech Software Engineering", "B.Tech Computer Science"],
        "certifications": ["AWS Certified Solutions Architect Professional", "TOGAF Certified"],
        "location_preference": ["Chennai", "Bangalore", "Remote"],
        "salary_expectation": 3500000,
        "availability": "3 months notice",
        "languages": ["English", "Hindi", "Tamil"],
        "last_updated": (datetime.now() - timedelta(days=25)).isoformat()
    },
    {
        "id": 225,
        "name": "Raghav Kapoor",
        "contact": "raghav.k@example.com",
        "phone": "+91-654-321-0985",
        "current_role": "Game Developer",
        "experience_years": 4,
        "skills": ["Unity", "C#", "3D Modeling", "Game Design", "AR/VR Development"],
        "education": ["B.Tech Computer Science"],
        "certifications": ["Unity Certified Developer", "AR Foundation Certificate"],
        "location_preference": ["Pune", "Bangalore", "Remote"],
        "salary_expectation": 1800000,
        "availability": "1 month notice",
        "languages": ["English", "Hindi", "Punjabi"],
        "last_updated": (datetime.now() - timedelta(days=7)).isoformat()
    }
]

def calculate_match_score(candidate, requirements):
    """Calculate a match score (0-100) based on how well a candidate matches requirements"""
    score = 0
    total_weight = 0
    
    # Skills matching (weight: 40)
    if 'skills' in requirements and requirements['skills']:
        weight = 40
        total_weight += weight
        required_skills = set(skill.lower() for skill in requirements['skills'])
        candidate_skills = set(skill.lower() for skill in candidate['skills'])
        matched_skills = required_skills.intersection(candidate_skills)
        skill_score = len(matched_skills) / len(required_skills) if required_skills else 0
        score += skill_score * weight
    
    # Experience matching (weight: 25)
    if 'min_experience' in requirements and requirements['min_experience'] is not None:
        weight = 25
        total_weight += weight
        min_exp = float(requirements['min_experience'])
        candidate_exp = candidate['experience_years']
        exp_score = min(1.0, candidate_exp / min_exp) if min_exp > 0 else 1.0
        score += exp_score * weight
    
    # Location matching (weight: 15)
    if 'location' in requirements and requirements['location']:
        weight = 15
        total_weight += weight
        location_match = any(loc.lower() == requirements['location'].lower() for loc in candidate['location_preference'])
        if location_match or ('Remote' in candidate['location_preference'] and requirements['location'].lower() == 'remote'):
            score += weight
    
    # Education matching (weight: 10)
    if 'education' in requirements and requirements['education']:
        weight = 10
        total_weight += weight
        education_match = any(edu.lower().find(requirements['education'].lower()) >= 0 for edu in candidate['education'])
        if education_match:
            score += weight
    
    # Availability matching (weight: 10)
    if 'availability' in requirements and requirements['availability'] is not None:
        weight = 10
        total_weight += weight
        if requirements['availability'] and candidate['availability'].lower() == 'immediately':
            score += weight
        elif not requirements['availability']:
            score += weight
    
    # Normalize score
    normalized_score = score / total_weight * 100 if total_weight > 0 else 0
    return round(normalized_score, 1)

@linkedin_bp.route('/candidates/search', methods=['GET', 'POST'])
def search_candidates():
    """Search for candidates based on filters"""
    if request.method == 'POST':
        # For complex searches with multiple criteria
        requirements = request.json
    else:
        # For simple GET requests with URL parameters
        requirements = {
            'skills': request.args.get('skills', '').split(',') if request.args.get('skills') else [],
            'min_experience': float(request.args.get('min_experience')) if request.args.get('min_experience') else None,
            'education': request.args.get('education'),
            'location': request.args.get('location'),
            'availability': request.args.get('availability', '').lower() == 'true' if request.args.get('availability') else None
        }
    
    # Filter out empty values
    requirements = {k: v for k, v in requirements.items() if v}
    
    # Get page parameters
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 10))
    
    # Apply filters and calculate match scores
    results = []
    for candidate in candidates:
        match_score = calculate_match_score(candidate, requirements)
        
        # Only include candidates with a match score above 30%
        if match_score >= 30:
            # Create a summary version of the candidate for results list
            results.append({
                'id': candidate['id'],
                'name': candidate['name'],
                'current_role': candidate['current_role'],
                'experience_years': candidate['experience_years'],
                'key_skills': candidate['skills'][:3],  # Just show top 3 skills
                'location_preference': candidate['location_preference'],
                'availability': candidate['availability'],
                'match_score': match_score
            })
    
    # Sort by match score
    results.sort(key=lambda x: x['match_score'], reverse=True)
    
    # Paginate results
    start_idx = (page - 1) * per_page
    end_idx = start_idx + per_page
    paginated_results = results[start_idx:end_idx]
    
    return jsonify({
        'total_matches': len(results),
        'page': page,
        'per_page': per_page,
        'total_pages': (len(results) + per_page - 1) // per_page,
        'candidates': paginated_results
    })

@linkedin_bp.route('/candidates/<int:candidate_id>', methods=['GET'])
def get_candidate_details(candidate_id):
    """Get detailed information for a specific candidate"""
    for candidate in candidates:
        if candidate['id'] == candidate_id:
            # Create a copy to avoid modifying the original data
            candidate_data = dict(candidate)
            
            # Add a random number of profile views (for realism)
            candidate_data['profile_views'] = random.randint(50, 500)
            
            return jsonify(candidate_data)
    
    return jsonify({'error': 'Candidate not found'}), 404

@linkedin_bp.route('/requirements/submit', methods=['POST'])
def submit_requirements():
    """Submit detailed job requirements and get matching candidates"""
    job_requirements = request.json
    
    if not job_requirements:
        return jsonify({'error': 'No requirements provided'}), 400
    
    # Validate required fields
    required_fields = ['job_title', 'skills']
    missing_fields = [field for field in required_fields if field not in job_requirements]
    if missing_fields:
        return jsonify({'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400
    
    # Process requirements and find matches
    matches = []
    for candidate in candidates:
        match_score = calculate_match_score(candidate, job_requirements)
        
        if match_score >= 50:  # Higher threshold for detailed job requirements
            # Create a detailed match result
            matches.append({
                'id': candidate['id'],
                'name': candidate['name'],
                'current_role': candidate['current_role'],
                'experience_years': candidate['experience_years'],
                'skills': candidate['skills'],
                'education': candidate['education'],
                'certifications': candidate['certifications'],
                'location_preference': candidate['location_preference'],
                'availability': candidate['availability'],
                'match_score': match_score,
                'salary_expectation': candidate['salary_expectation']
            })
    
    # Sort by match score
    matches.sort(key=lambda x: x['match_score'], reverse=True)
    
    # Return the job requirements and matching candidates
    return jsonify({
        'job_requirements': job_requirements,
        'total_matches': len(matches),
        'top_matches': matches[:5],  # Return top 5 matches
        'all_matches': matches
    })

# Register the blueprint in your main app
def register_linkedin_routes(app):
    app.register_blueprint(linkedin_bp)
