import './globals.css';
import Nav from '../components/Nav';
import Footer from '../components/Footer';


export default function RootLayout({ children }) {
    return (
        <html lang="it" >
        <head>
            <title>estudentsleague</title>
            <meta name="description" content="estudentsleague"/>
            <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
            <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
            <link rel="shortcut icon" href="/favicon.ico" />
            <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
            <meta name="apple-mobile-web-app-title" content="LCS" />
            <link rel="manifest" href="/site.webmanifest" />
            <link rel="stylesheet" href="https://use.typekit.net/ajb7nmd.css"/>
            {/* Google Fonts gestiti da next/font/google */}
            <style>{`
                html {
                    font-family: "helvetica-lt-pro", sans-serif;
                    font-weight: 300;
                    font-style: normal;
                }
            `}</style>
        </head>
        <body>
        <Nav/>
        <main className="main">
            {children}
        </main>
        <Footer/>
        </body>
        </html>
    );
}