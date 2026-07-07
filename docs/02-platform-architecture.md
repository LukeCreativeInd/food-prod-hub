# Platform Architecture

Food Prod Hub should use one codebase for multiple tenants and organisations.

Each tenant may have its own branding, modules, users, and data. The app should prefer configuration over custom code per client. Custom configuration is good; custom forks per client should be avoided.

## Future Domain Structure

- `projectname.com` = public marketing website
- `app.projectname.com` = central login/redirect portal
- `cleaneats.projectname.com` = Clean Eats tenant app
- `admin.projectname.com` = future platform admin/control centre

## Environments

- Development
- Staging
- Production

## Deployment Flow

1. Codex/dev
2. Staging
3. Approval
4. Production

## Architecture Principles

- Use one codebase for all tenants.
- Keep tenant-specific branding, modules, users, and data isolated by configuration and platform structure.
- Prefer configurable modules and settings over custom client code.
- Avoid client-specific forks unless there is a clear, approved platform reason.
- Plan platform admin tools separately from tenant operations tools.
