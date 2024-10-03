import {
  AuthTokenDetails,
  PostDetails,
  PostResponse,
  SocialProvider,
} from '@gitroom/nestjs-libraries/integrations/social/social.integrations.interface';
import { makeId } from '@gitroom/nestjs-libraries/services/make.is';
import { SocialAbstract } from '@gitroom/nestjs-libraries/integrations/social.abstract';
import dayjs from 'dayjs';
import { Integration } from '@prisma/client';

export class SlackProvider extends SocialAbstract implements SocialProvider {
  identifier = 'slack';
  name = 'Slack';
  isBetweenSteps = false;
  scopes = ['identify', 'guilds'];
  async refreshToken(refreshToken: string): Promise<AuthTokenDetails> {
    const { access_token, expires_in, refresh_token } = await (
      await this.fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        body: new URLSearchParams({
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        }),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(
            process.env.DISCORD_CLIENT_ID +
              ':' +
              process.env.DISCORD_CLIENT_SECRET
          ).toString('base64')}`,
        },
      })
    ).json();

    const { application } = await (
      await fetch('https://discord.com/api/oauth2/@me', {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })
    ).json();

    return {
      refreshToken: refresh_token,
      expiresIn: expires_in,
      accessToken: access_token,
      id: '',
      name: application.name,
      picture: '',
      username: '',
    };
  }
  async generateAuthUrl(refresh?: string) {
    const state = makeId(6);

    return {
      url: `https://slack.com/oauth/v2/authorize?client_id=${
        process.env.SLACK_ID
      }&redirect_uri=${encodeURIComponent(
        `${
          process?.env?.FRONTEND_URL?.indexOf('https') === -1
            ? 'https://redirectmeto.com/'
            : ''
        }${process?.env?.FRONTEND_URL}/integrations/social/slack${
          refresh ? `?refresh=${refresh}` : ''
        }`
      )}&scope=channels:read,chat:write,users:read,groups:read,channels:join,chat:write.customize&state=${state}`,
      codeVerifier: makeId(10),
      state,
    };
  }

  async authenticate(params: {
    code: string;
    codeVerifier: string;
    refresh?: string;
  }) {
    const { access_token, team, bot_user_id, authed_user, ...all } = await (
      await this.fetch(`https://slack.com/api/oauth.v2.access`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: process.env.SLACK_ID!,
          client_secret: process.env.SLACK_SECRET!,
          code: params.code,
          redirect_uri: `${
            process?.env?.FRONTEND_URL?.indexOf('https') === -1
              ? 'https://redirectmeto.com/'
              : ''
          }${process?.env?.FRONTEND_URL}/integrations/social/slack${
            params.refresh ? `?refresh=${params.refresh}` : ''
          }`,
        }),
      })
    ).json();

    const { user } = await (
      await fetch(`https://slack.com/api/users.info?user=${bot_user_id}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })
    ).json();

    return {
      id: team.id,
      name: user.real_name,
      accessToken: access_token,
      refreshToken: 'null',
      expiresIn: dayjs().add(100, 'years').unix() - dayjs().unix(),
      picture: user.profile.image_48,
      username: user.name,
    };
  }

  async channels(accessToken: string, params: any, id: string) {
    const list = await (
      await fetch(
        `https://slack.com/api/conversations.list?types=public_channel,private_channel`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
    ).json();

    return list.channels.map((p: any) => ({
      id: p.id,
      name: p.name,
    }));
  }

  async post(
    id: string,
    accessToken: string,
    postDetails: PostDetails[],
    integration: Integration
  ): Promise<PostResponse[]> {
    await fetch(`https://slack.com/api/conversations.join`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channel: postDetails[0].settings.channel,
      }),
    });

    let lastId = '';
    for (const post of postDetails) {
      const { ts } = await (
        await fetch(`https://slack.com/api/chat.postMessage`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            channel: postDetails[0].settings.channel,
            username: integration.name,
            icon_url: integration.picture,
            ...(lastId ? { thread_ts: lastId } : {}),
            blocks: [
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: post.message,
                },
              },
              ...(post.media?.length
                ? post.media.map((m) => ({
                    type: 'image',
                    image_url: m.url,
                    alt_text: '',
                  }))
                : []),
            ],
          }),
        })
      ).json();

      lastId = ts;
    }

    return [];
  }

  async changeProfilePicture(id: string, accessToken: string, url: string) {
    return {
      url,
    };
  }

  async changeNickname(id: string, accessToken: string, name: string) {
    return {
      name,
    };
  }
}
