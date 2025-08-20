import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';

import { requireAuth } from '@/lib/auth-guard';
import { Chat } from '@/components/chat';
import { getActiveSubscriptionByUserId, getAgentIdsByChatId, getChatById, getMessagesByChatId } from '@/lib/db/queries';
import { DataStreamHandler } from '@/components/data-stream-handler';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';
import { convertToUIMessages } from '@/lib/utils';
import type { Metadata } from 'next';

export async function generateMetadata(
  { params }: { params: { id: string } },
): Promise<Metadata> {
  const { id } = params;
  const chat = await getChatById({ id });
  const title = chat?.title?.trim() || 'Chat';
  const encoded = encodeURIComponent(title);
  return {
    title,
    openGraph: {
      images: [{ url: `/opengraph-image?title=${encoded}` }],
    },
    twitter: {
      images: [{ url: `/opengraph-image?title=${encoded}` }],
    },
  };
}

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  const chat = await getChatById({ id });

  if (!chat) {
    notFound();
  }

  const user = await requireAuth();

  const active = await getActiveSubscriptionByUserId({ userId: user.id });
  if (!active) {
    redirect('/billing');
  }

  if (chat.visibility === 'private') {
    if (!user) {
      return notFound();
    }

    if (user.id !== chat.userId) {
      return notFound();
    }
  }

  const messagesFromDb = await getMessagesByChatId({
    id,
  });

  const uiMessages = convertToUIMessages(messagesFromDb);

  const cookieStore = await cookies();
  const chatModelFromCookie = cookieStore.get('chat-model-small');
  // Prefer DB-backed selection; cookie remains a fallback for first-time use
  let initialSelectedAgentIds: string[] = await getAgentIdsByChatId({ chatId: id });
  if (!Array.isArray(initialSelectedAgentIds) || initialSelectedAgentIds.length === 0) {
    const expertCookie = cookieStore.get('selected-experts');
    try {
      initialSelectedAgentIds = expertCookie?.value
        ? JSON.parse(decodeURIComponent(expertCookie.value))
        : [];
    } catch {
      initialSelectedAgentIds = [];
    }
  }

  if (!chatModelFromCookie) {
    return (
      <>
        <Chat
          id={chat.id}
          initialMessages={uiMessages}
          initialChatModel={DEFAULT_CHAT_MODEL}
          initialVisibilityType={chat.visibility}
          isReadonly={user?.id !== chat.userId}
          session={{ user: { ...user, type: 'regular' } } as any}
          autoResume={true}
          initialSelectedAgentIds={initialSelectedAgentIds}
        />
        <DataStreamHandler />
      </>
    );
  }

  return (
    <>
      <Chat
        id={chat.id}
        initialMessages={uiMessages}
        initialChatModel={chatModelFromCookie.value}
        initialVisibilityType={chat.visibility}
        isReadonly={user?.id !== chat.userId}
        session={{ user: { ...user, type: 'regular' } } as any}
        autoResume={true}
        initialSelectedAgentIds={initialSelectedAgentIds}
      />
      <DataStreamHandler />
    </>
  );
}
