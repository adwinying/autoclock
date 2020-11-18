import util from 'util'
import childProcess from 'child_process'

const exec = util.promisify(childProcess.exec);

export const getTotp = async () => {
  const totpName = process.env.TOTP_NAME
  const passCmd  = `pass otp ${totpName}`

  const { stdout, stderr } = await exec(passCmd)

  if (stderr) {
    console.error(stderr)
    return null
  }

  return stdout
}
