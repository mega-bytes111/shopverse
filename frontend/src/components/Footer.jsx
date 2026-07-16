const Footer = () => {
  return (
    <footer className="border-t bg-white">
      <div className="container max-w-6xl py-6 text-sm text-gray-500">
        © {new Date().getFullYear()} ShopVerse. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;