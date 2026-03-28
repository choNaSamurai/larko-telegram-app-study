# Screen Naming Convention

All scenario files and parsed screen records **must** follow this naming convention.

## Rule

`SCREEN_[PascalCaseName]`

- Prefix: `SCREEN_`
- Name: PascalCase representation of the Figma frame/layer name
- Spaces → underscore `_`
- No special characters except `_`

## Examples

| Figma Layer Name | Screen Name |
|-----------------|-------------|
| `Login` | `SCREEN_Login` |
| `Dashboard Home` | `SCREEN_Dashboard_Home` |
| `Onboarding / Step 1` | `SCREEN_Onboarding_Step_1` |
| `User Profile - Settings` | `SCREEN_User_Profile_Settings` |
| `404 Error` | `SCREEN_404_Error` |

## File Name

Each screen produces one file: `scenario/SCREEN_[Name].md`

## Node ID Reference

Always store the `node_id` alongside the screen name for traceability back to the Figma source.
