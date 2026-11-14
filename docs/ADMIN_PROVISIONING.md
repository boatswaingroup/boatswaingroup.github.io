# Initial administrator provisioning

The API deliberately has no public endpoint for promoting a customer to administrator. Create the first administrator from a trusted operator workstation or a controlled one-off deployment shell with database access.

From the backend/ directory:

1. Set the production database connection string in DATABASE_URL.
2. Set a unique administrator identity and a strong password of at least 16 characters.
3. Set CONFIRM_ADMIN_PROVISIONING=YES as an explicit one-time confirmation.
4. Run npm run admin:provision.
5. Confirm the output identifies the intended email, then remove the bootstrap variables from the shell/deployment environment.

Required environment variables:
- DATABASE_URL
- ADMIN_FULL_NAME
- ADMIN_EMAIL
- ADMIN_PHONE
- ADMIN_PASSWORD
- CONFIRM_ADMIN_PROVISIONING=YES

Security properties:
- This is a command-line task, not an HTTP route; it is not callable by website visitors.
- The script hashes the password with bcrypt before storing it.
- It creates an ADMIN account only when the email does not already exist.
- It refuses to elevate, overwrite, or reset an existing account.
- It never prints the password or password hash.
- The API's normal JWT authentication and ADMIN role check still protect staff endpoints.

Operational precautions:
- Run only from a trusted machine/session with least-privilege database access.
- Do not commit .env files, paste secrets into GitHub issues, or put passwords in shell history. Prefer your platform's temporary secret-injection facility.
- Remove the bootstrap variables immediately after execution.
- Protect the resulting administrator mailbox and use a unique password stored in an approved password manager.
- If provisioning fails, investigate the cause; do not work around it by adding a public role-change endpoint.

This command provisions an administrator identity only. Email verification, password recovery, MFA, session revocation and audit logging remain separate production security work and must be completed before public launch.
