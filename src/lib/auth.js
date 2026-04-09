import GoogleProvider from "next-auth/providers/google";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      await connectDB();

      const existingUser = await User.findOne({ email: user.email });

      if (!existingUser) {
        // New user - will be redirected to register page
        await User.create({
          name: user.name,
          email: user.email,
          profileImage: user.image,
          isVerified: true,
          isProfileComplete: false,
        });
        return true;
      }

      // Existing user - will be redirected to home page
      return true;
    },

    async redirect({ url, baseUrl }) {
      // Handle redirect after sign-in
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === new URL(baseUrl).origin) return url;
      return baseUrl;
    },

    async session({ session }) {
      await connectDB();

      const dbUser = await User.findOne({ email: session.user.email });

      if (!dbUser) {
        return session;
      }

      session.user.id = dbUser._id.toString();
  session.user.name = dbUser.name || session.user.name;
  session.user.email = dbUser.email || session.user.email;
      session.user.phone = dbUser.phone || "";
      session.user.isProfileComplete = Boolean(dbUser.isProfileComplete);
      session.user.profileImage = dbUser.profileImage;

      return session;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  secret: process.env.NEXTAUTH_SECRET,
};
