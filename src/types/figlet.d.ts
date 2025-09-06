declare module 'figlet' {
  const figlet: {
    textSync: (text: string, options?: { font?: string }) => string;
  };
  export default figlet;
}
