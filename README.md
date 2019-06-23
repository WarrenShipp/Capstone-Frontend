# Capstone-Frontend
Frontend for the capstone Renegades project. This repository contains all files needed to develop the application using NativeScript Sidekick.

# Getting Started

## Prerequisites

Development requires installation of GitHub

## Installation

Language used: JavaScript (NodeJS)

Framework: NativeScript

Development Platform: NativeScript Sidekick

Required tools:

- NativeScript Sidekick
- Nodejs
- Npm
- NativeScipt CLI
- Visual studio
- Android Device or emulator

Download NativeScript Sidekick from this link: https://www.nativescript.org/nativescript-sidekick

Download latest version of nodejs from this link: https://nodejs.org/en/

Download Visual studio from this link: https://visualstudio.microsoft.com/

Full step-by-step setup guide can be found here: https://docs.nativescript.org/start/quick-setup

This includes a setup verification step by running tns doctor in the terminal. Which will check the installation status.

To further test and verify that the installation is working, an android device would be needed to be connected to the machine. Connected devices will be automatically detected by NativeScript Sidekick and the application will be installed on the selected device for testing.

To create a simple application for testing, a simple application guide is available here: https://docs.nativescript.org/start/cli-basics

Setup of visual studio with javascript follow a guide here: https://code.visualstudio.com/docs/languages/javascript

This guide provides guidance on getting linting, autocompletion and other helpful tools for developing JavaScript programs

## Building

The application can be built using local builds on Sidekick. A guide for deployment can be found here: https://docs.nativescript.org/sidekick/user-guide/run-app/run-app-on-device

Precompiled versions have been built on CircleCI. Using a prebuilt .apk requires a Github account and access to this repository. If those prerequisites are met, access to CircleCI builds will be granted. The full instructions are as follows:

- Login to CircleCI using your github account at this link: https://circleci.com/
- Follow the frontend development project: rmit-s3628653-alex-huang/Capstone-Frontend
- Select the desired branch
- Rerun the workflow if necessary
- Select the Artifacts tab and navigate to Container /home/circlecicricket-frontend/build/android.apk to download
- Drag and drop apk into an emulator or install apk directly into connected mobile device

# Current State

This section lists the current status of the project.

## Currently Known Bugs

- bugfix - re01 - Back buttons disrupting upload
- bugfix - re02 - Results page not showing message when no results available
- bugfix - re03 - Phone numbers not being validated
- bugfix - re04 - New accounts created does not have date of birth
- bugfix - re05 - When changing player to coach, date of birth is erased
- bugfix - re06 - App breaks when restarting
- bugfix - re07 - Videos are not playing
