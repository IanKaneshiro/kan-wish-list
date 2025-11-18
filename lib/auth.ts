import NextAuth, { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import connectDB from "@/lib/db";
import { User } from "@/lib/models/User";
import { Wishlist } from "@/lib/models/Wishlist";

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          await connectDB();

          // Check if user exists
          let dbUser = await User.findOne({ email: user.email });

          if (!dbUser) {
            // Create new user
            dbUser = await User.create({
              email: user.email,
              name: user.name || profile?.name,
              image: user.image || profile?.image,
              groups: [],
              notifications: [],
              settings: {
                emailNotifications: false,
                reduceMotion: false,
              },
            });

            console.log("Created new user:", dbUser._id);

            // Auto-create wishlist for new user (without group initially)
            const wishlist = await Wishlist.create({
              ownerId: dbUser._id,
              groupId: null, // Will be set when user joins a group
              items: [],
            });

            console.log("Created wishlist:", wishlist._id);

            // Update user with wishlist reference
            dbUser.wishlist = wishlist._id;
            await dbUser.save();

            console.log("Updated user with wishlist reference");
          } else if (!dbUser.wishlist) {
            // User exists but doesn't have a wishlist - create one
            console.log("User exists without wishlist, creating one");
            const wishlist = await Wishlist.create({
              ownerId: dbUser._id,
              groupId: null,
              items: [],
            });

            dbUser.wishlist = wishlist._id;
            await dbUser.save();
            console.log("Created wishlist for existing user:", wishlist._id);
          }
        } catch (error) {
          console.error("Error in signIn callback:", error);
          return false;
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (token.sub) {
        try {
          await connectDB();
          const dbUser = await User.findOne({ email: session.user?.email });

          if (dbUser) {
            session.user.id = dbUser._id.toString();
            session.user.groups = dbUser.groups.map((g) => g.toString());
            session.user.wishlistId = dbUser.wishlist?.toString();
            console.log("Session created for user:", dbUser.email, "wishlistId:", session.user.wishlistId);
          } else {
            console.error("User not found in session callback for email:", session.user?.email);
          }
        } catch (error) {
          console.error("Error in session callback:", error);
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
