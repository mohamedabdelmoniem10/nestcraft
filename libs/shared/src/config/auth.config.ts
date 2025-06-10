import { registerAs } from "@nestjs/config";

export interface AuthConfig {
  jwt: {
    secret: string;
    expiresIn: string;
    refreshSecret: string;
    refreshExpiresIn: string;
  };
  bcrypt: {
    saltRounds: number;
  };
  session: {
    maxAge: number;
    httpOnly: boolean;
    secure: boolean;
  };
  oauth: {
    google: {
      clientId?: string;
      clientSecret?: string;
    };
    github: {
      clientId?: string;
      clientSecret?: string;
    };
  };
}

export default registerAs(
  "auth",
  (): AuthConfig => ({
    jwt: {
      secret:
        process.env.JWT_SECRET ||
        "nestcraft-super-secret-key-change-in-production",
      expiresIn: process.env.JWT_EXPIRES_IN || "15m",
      refreshSecret:
        process.env.JWT_REFRESH_SECRET ||
        "nestcraft-refresh-secret-change-in-production",
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    },
    bcrypt: {
      saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || "12", 10),
    },
    session: {
      maxAge: parseInt(process.env.SESSION_MAX_AGE || "86400000", 10), // 24 hours
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    },
    oauth: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      },
      github: {
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
      },
    },
  })
);
