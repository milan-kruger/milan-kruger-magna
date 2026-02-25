# **Trafman Transgressions**

# Development

## Requirements
- NodeJS version 18.15.0 (or later)

## Build

### Build Web
`npm install`
- Production Web Build: `npm run build`

Build can be found in [build](./build/) folder.

Or use the Docker container to do the build: `docker-compose --profile build up`

### Build Electron
`npm install`
- Production Electron Build for Windows: `npm run electron:release:win`
- Production Electron Build for Linux: `npm run electron:release:linux`

Electron build can be found in [dist](./dist/) folder.

## Test
`npm test`
- [Test Report](./coverage/jest-test-result.json)
- [Coverage Report](./coverage/lcov-report/index.html)

## Run

### Run Web
`npm start`

Or use the Docker container to run the application: `docker-compose --profile run up -d`

### Run Electron
`npm run electron:start`


# Configuration

## Config File
The application's settings file can be found at [public/config.json](./public/config.json).

Available settings:
- `environment`: The currently running environment (DEV, TEST, etc.).
- `apiBaseUrl`: The base URL of the backend.
- `theme`: The colors to use for the theme.

## Language Files
The translation messages can be found in the [src/framework/i18n/](./src/framework/i18n/) and [src/project/i18n/](./src/project/i18n/) folders.

## Images
The images used by the application can be found in the [src/assets/images](./src/assets/images) and [public](./public) folders.


# Tools

## SVG
When adding SVG files make sure to run the `svgo:optimize` script to make the SVG files load correctly in React.

## RTK Query
To autogenerate new RTK Query API code, run the `rtk-query:codegen:project` script.

*Note that for the **transgressionsApi**, this will also run scripts to replace type definitions ending in "Base"  and generate the following:*
* [Roles](./src/project/auth/roles.ts)
* [JsonObjectType](./src/project/enum/JsonObjectType.ts)

Also see the [openapi-config.json](./src/project/openapi-config.json) configuration file.

_Note that the Swagger backend needs to be running at the location defined in the `schemaFile` property (of `openapi-config.json`) for this to work._

## Licenses
To evaluate the licenses of the dependencies the `license:summary` and `license:csv` scripts can be used.


# Links

## MUI:
- [MUI Components](https://mui.com/material-ui/)
- [Theme creator](https://zenoo.github.io/mui-theme-creator/#)
