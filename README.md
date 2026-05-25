# Encicla
Development the form for the registration by new users

# How to start, you most stay in /encicla

## First step
In Windows, excute:
bash `
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
`

If you prefer to leave it permanent for your user
bash `
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
`

## Second step
Install pnpm
bash `
npm i -g pnpm@9
`

### Confirm version of pnpm
bash `
nnpm -v
`

## install dependencies by project
bash `
pnpm -F web-form/admin install
`

## Run App(in this case web form, i would stay in /encicla)
bash `
pnpm -F web-form dev
`

## Add Package
bash `
pnpm -F web-form add @namepackage
`
