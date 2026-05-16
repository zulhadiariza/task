import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "johndoe@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        await dbConnect();

        const user = await User.findOne({ email: credentials.email });
        if (!user) {
          throw new Error("No user found with that email");
        }

        if (!user.password) {
          throw new Error("This account uses Google Login. Please sign in with Google.");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error("Invalid password");
        }

        return { id: user._id.toString(), name: user.username, email: user.email };
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          await dbConnect();
          
          let existingUser = await User.findOne({ email: user.email });
          
          if (!existingUser) {
            const baseUsername = user.name ? user.name.replace(/\s+/g, '').toLowerCase() : user.email.split('@')[0];
            let username = baseUsername;
            let counter = 1;
            
            while (await User.findOne({ username })) {
              username = `${baseUsername}${counter}`;
              counter++;
            }
            
            existingUser = await User.create({
              username: username,
              email: user.email,
            });
          }
          
          user.id = existingUser._id.toString();
          user.name = existingUser.username;
          return true;
        } catch (error) {
          console.error("Error during Google sign-in:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.name = token.name;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
