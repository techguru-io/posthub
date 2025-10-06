# Posthub NodeJS SDK

This is the NodeJS SDK for [Posthub](https://posthub.com).

You can start by installing the package:

```bash
npm install @posthub/node
```

## Usage
```typescript
import Posthub from '@posthub/node';
const posthub = new Posthub('your api key', 'your self-hosted instance (optional)');
```

The available methods are:
- `post(posts: CreatePostDto)` - Schedule a post to Posthub
- `postList(filters: GetPostsDto)` - Get a list of posts
- `upload(file: Buffer, extension: string)` - Upload a file to Posthub
- `integrations()` - Get a list of connected channels
- `deletePost(id: string)` - Delete a post by ID

Alternatively you can use the SDK with curl, check the [Posthub API documentation](https://docs.posthub.com/public-api) for more information.