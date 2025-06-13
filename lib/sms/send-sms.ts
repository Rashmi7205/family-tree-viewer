export async function sendOTP(
  phoneNumber: string,
  otp: string
): Promise<{ otpSent: boolean }> {
  // try {
  //   const response = await fetch(
  //     "https://www.fast2sms.com/dev/bulkV2?" +
  //       new URLSearchParams({
  //         authorization: process.env.SMS_PROVIDER_API_KEY!,
  //         variables_values: otp,
  //         route: "otp",
  //         numbers: phoneNumber,
  //       }),
  //     {
  //       method: "GET",
  //       headers: {
  //         "cache-control": "no-cache",
  //       },
  //     }
  //   );

  //   if (!response.ok) {
  //     throw new Error(`HTTP error! Status: ${response.status}`);
  //   }

  //   const data = await response.json();
  //   console.log("OTP API response:", data);

  //   // Adjust this logic based on the actual API response
  //   const otpSent = data.return === true;

   // return { otpSent };
  return {otpSent:true}
  // } catch (error) {
  //   console.error("Error sending OTP:", error);
  //   return { otpSent: false };
  // }
}
