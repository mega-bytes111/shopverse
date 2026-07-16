const loadRazorpay = () =>
  new Promise((resolve) => {
    const existing = document.getElementById("razorpay-sdk");
    if (existing) return resolve(true);

    const script = document.createElement("script");
    script.id = "razorpay-sdk";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export default loadRazorpay;