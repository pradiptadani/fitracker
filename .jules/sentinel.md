
## 2024-05-24 - [Login Brute Force Vulnerability]
**Vulnerability:** Found a lack of rate limiting on the `/api/auth/login` endpoint, enabling attackers to make unlimited login attempts and perform brute force attacks to guess user passwords and potentially perform a Denial of Service attack via resource exhaustion since Argon2 hashing is expensive.
**Learning:** Even internal-only or single-user applications can suffer severe resource exhaustion via unauthenticated paths due to the intentional high computation cost of secure password hashing algorithms like Argon2. A lack of rate limiting acts as a force multiplier for DoS attacks.
**Prevention:** Always implement rate limiting on authentication routes as a fundamental defense-in-depth measure, independent of the intended user base size or current API structure.
