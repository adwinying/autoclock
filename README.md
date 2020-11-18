# autoclock

Microsoft Teams Shifts auto clock in/out script

## Dependencies
- [pass-otp](https://github.com/tadfisher/pass-otp) + pass
- node + npm

## Installation

1. Init `pass` store

2. Get TOTP QR code from Microsoft [here](https://account.activedirectory.windowsazure.com/Proofup.aspx) (Confirgure app without notifications)

3. Create `pass-otp` entry

```bash
$ zbarimg -q --raw qrcode.png | pass otp add [TOTP name here]
```

4. Clone project

```bash
$ git clone https://github.com/adwinying/autoclock
```

5. Install dependencies

```bash
$ cd autoclock && npm ci
```

6. Configure .env

```bash
$ cp .env.example .env
```

7. Run script

```bash
# Clock in
$ node main.js in

# Clock out
$ node main.js out
```
