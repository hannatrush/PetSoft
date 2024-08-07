import Logo from '@/components/logo';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col gap-y-5 justify-center items-center min-h-screen">
      <Logo />
      {children}
    </div>
  );
};

export default Layout;
