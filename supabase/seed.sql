
-- Disable triggers temporarily for faster inserts
ALTER TABLE auth.users DISABLE TRIGGER ALL;
ALTER TABLE public.profiles DISABLE TRIGGER ALL;
ALTER TABLE public.workspaces DISABLE TRIGGER ALL;
ALTER TABLE public.workspace_members DISABLE TRIGGER ALL;
ALTER TABLE public.channels DISABLE TRIGGER ALL;
ALTER TABLE public.messages DISABLE TRIGGER ALL;
ALTER TABLE public.direct_messages DISABLE TRIGGER ALL;
ALTER TABLE public.direct_message_participants DISABLE TRIGGER ALL;
ALTER TABLE public.reactions DISABLE TRIGGER ALL;

-- Create users

    INSERT INTO auth.users (id, email, raw_user_meta_data)
    VALUES (
      '67cb4ce4-92dc-431a-a33b-d4d653cb6723',
      'alicejohnson@example.com',
      jsonb_build_object('username', 'alicejohnson')
    );
  

    INSERT INTO auth.users (id, email, raw_user_meta_data)
    VALUES (
      '806cfcd5-efc7-4651-9729-77a121eef3e8',
      'bobsmith@example.com',
      jsonb_build_object('username', 'bobsmith')
    );
  

    INSERT INTO auth.users (id, email, raw_user_meta_data)
    VALUES (
      '3fd95927-1a76-4f09-a66b-448b72658deb',
      'charliebrown@example.com',
      jsonb_build_object('username', 'charliebrown')
    );
  

    INSERT INTO auth.users (id, email, raw_user_meta_data)
    VALUES (
      '443357eb-7e6a-47da-a7da-a19b9585d512',
      'dianaprince@example.com',
      jsonb_build_object('username', 'dianaprince')
    );
  

    INSERT INTO auth.users (id, email, raw_user_meta_data)
    VALUES (
      '6ba3bace-ad2a-4339-b736-b5c61ec15820',
      'ethanhunt@example.com',
      jsonb_build_object('username', 'ethanhunt')
    );
  

    INSERT INTO auth.users (id, email, raw_user_meta_data)
    VALUES (
      'e5bedc5f-67f4-4b39-9f95-26c76347fc69',
      'fionaapple@example.com',
      jsonb_build_object('username', 'fionaapple')
    );
  

    INSERT INTO auth.users (id, email, raw_user_meta_data)
    VALUES (
      '9f5a3c50-b2c3-4551-8752-e253ff1a5d31',
      'georgeclooney@example.com',
      jsonb_build_object('username', 'georgeclooney')
    );
  

    INSERT INTO auth.users (id, email, raw_user_meta_data)
    VALUES (
      '6ba41291-b106-4c1c-b817-d54571d2a28b',
      'hannahmontana@example.com',
      jsonb_build_object('username', 'hannahmontana')
    );
  

    INSERT INTO auth.users (id, email, raw_user_meta_data)
    VALUES (
      '060ea3fe-86cd-497b-8349-5de9769b0082',
      'ianmckellen@example.com',
      jsonb_build_object('username', 'ianmckellen')
    );
  

    INSERT INTO auth.users (id, email, raw_user_meta_data)
    VALUES (
      'ef117e44-2249-4414-a939-a033e08c1335',
      'juliaroberts@example.com',
      jsonb_build_object('username', 'juliaroberts')
    );
  

    INSERT INTO auth.users (id, email, raw_user_meta_data)
    VALUES (
      '12dbeda9-5270-4e01-8338-44e1661c2585',
      'kevinbacon@example.com',
      jsonb_build_object('username', 'kevinbacon')
    );
  

    INSERT INTO auth.users (id, email, raw_user_meta_data)
    VALUES (
      '4327986b-6f1d-4980-8f8c-76205d0fb110',
      'laracroft@example.com',
      jsonb_build_object('username', 'laracroft')
    );
  

    INSERT INTO auth.users (id, email, raw_user_meta_data)
    VALUES (
      '597e989d-1906-40a6-89d5-d467f55cbc66',
      'michaelscott@example.com',
      jsonb_build_object('username', 'michaelscott')
    );
  

    INSERT INTO auth.users (id, email, raw_user_meta_data)
    VALUES (
      '44d2fa67-db3c-4532-a5a6-198db1e881ca',
      'natalieportman@example.com',
      jsonb_build_object('username', 'natalieportman')
    );
  

    INSERT INTO auth.users (id, email, raw_user_meta_data)
    VALUES (
      '4066bbbe-6e0e-422f-92c1-a7853a11019b',
      'oscarwilde@example.com',
      jsonb_build_object('username', 'oscarwilde')
    );
  

-- Create profiles

    INSERT INTO public.profiles (id, username, avatar_url, status)
    VALUES (
      '67cb4ce4-92dc-431a-a33b-d4d653cb6723',
      'alicejohnson',
      '/placeholder.svg?height=40&width=40',
      'online'
    );
  

    INSERT INTO public.profiles (id, username, avatar_url, status)
    VALUES (
      '806cfcd5-efc7-4651-9729-77a121eef3e8',
      'bobsmith',
      '/placeholder.svg?height=40&width=40',
      'busy'
    );
  

    INSERT INTO public.profiles (id, username, avatar_url, status)
    VALUES (
      '3fd95927-1a76-4f09-a66b-448b72658deb',
      'charliebrown',
      '/placeholder.svg?height=40&width=40',
      'offline'
    );
  

    INSERT INTO public.profiles (id, username, avatar_url, status)
    VALUES (
      '443357eb-7e6a-47da-a7da-a19b9585d512',
      'dianaprince',
      '/placeholder.svg?height=40&width=40',
      'online'
    );
  

    INSERT INTO public.profiles (id, username, avatar_url, status)
    VALUES (
      '6ba3bace-ad2a-4339-b736-b5c61ec15820',
      'ethanhunt',
      '/placeholder.svg?height=40&width=40',
      'busy'
    );
  

    INSERT INTO public.profiles (id, username, avatar_url, status)
    VALUES (
      'e5bedc5f-67f4-4b39-9f95-26c76347fc69',
      'fionaapple',
      '/placeholder.svg?height=40&width=40',
      'offline'
    );
  

    INSERT INTO public.profiles (id, username, avatar_url, status)
    VALUES (
      '9f5a3c50-b2c3-4551-8752-e253ff1a5d31',
      'georgeclooney',
      '/placeholder.svg?height=40&width=40',
      'online'
    );
  

    INSERT INTO public.profiles (id, username, avatar_url, status)
    VALUES (
      '6ba41291-b106-4c1c-b817-d54571d2a28b',
      'hannahmontana',
      '/placeholder.svg?height=40&width=40',
      'busy'
    );
  

    INSERT INTO public.profiles (id, username, avatar_url, status)
    VALUES (
      '060ea3fe-86cd-497b-8349-5de9769b0082',
      'ianmckellen',
      '/placeholder.svg?height=40&width=40',
      'offline'
    );
  

    INSERT INTO public.profiles (id, username, avatar_url, status)
    VALUES (
      'ef117e44-2249-4414-a939-a033e08c1335',
      'juliaroberts',
      '/placeholder.svg?height=40&width=40',
      'online'
    );
  

    INSERT INTO public.profiles (id, username, avatar_url, status)
    VALUES (
      '12dbeda9-5270-4e01-8338-44e1661c2585',
      'kevinbacon',
      '/placeholder.svg?height=40&width=40',
      'busy'
    );
  

    INSERT INTO public.profiles (id, username, avatar_url, status)
    VALUES (
      '4327986b-6f1d-4980-8f8c-76205d0fb110',
      'laracroft',
      '/placeholder.svg?height=40&width=40',
      'offline'
    );
  

    INSERT INTO public.profiles (id, username, avatar_url, status)
    VALUES (
      '597e989d-1906-40a6-89d5-d467f55cbc66',
      'michaelscott',
      '/placeholder.svg?height=40&width=40',
      'online'
    );
  

    INSERT INTO public.profiles (id, username, avatar_url, status)
    VALUES (
      '44d2fa67-db3c-4532-a5a6-198db1e881ca',
      'natalieportman',
      '/placeholder.svg?height=40&width=40',
      'busy'
    );
  

    INSERT INTO public.profiles (id, username, avatar_url, status)
    VALUES (
      '4066bbbe-6e0e-422f-92c1-a7853a11019b',
      'oscarwilde',
      '/placeholder.svg?height=40&width=40',
      'offline'
    );
  

-- Create workspaces

    INSERT INTO public.workspaces (id, name)
    VALUES ('f40da365-2661-48da-a37b-c317c3055c52', 'Design Workspace');
  

    INSERT INTO public.workspaces (id, name)
    VALUES ('a5bc9e11-50a4-4bfa-bb12-a305ef3ba0ef', 'Engineering Workspace');
  

-- Create workspace members

      INSERT INTO public.workspace_members (workspace_id, user_id)
      VALUES ('f40da365-2661-48da-a37b-c317c3055c52', '67cb4ce4-92dc-431a-a33b-d4d653cb6723');
    

      INSERT INTO public.workspace_members (workspace_id, user_id)
      VALUES ('f40da365-2661-48da-a37b-c317c3055c52', '806cfcd5-efc7-4651-9729-77a121eef3e8');
    

      INSERT INTO public.workspace_members (workspace_id, user_id)
      VALUES ('f40da365-2661-48da-a37b-c317c3055c52', '3fd95927-1a76-4f09-a66b-448b72658deb');
    

      INSERT INTO public.workspace_members (workspace_id, user_id)
      VALUES ('f40da365-2661-48da-a37b-c317c3055c52', '443357eb-7e6a-47da-a7da-a19b9585d512');
    

      INSERT INTO public.workspace_members (workspace_id, user_id)
      VALUES ('f40da365-2661-48da-a37b-c317c3055c52', '6ba3bace-ad2a-4339-b736-b5c61ec15820');
    

      INSERT INTO public.workspace_members (workspace_id, user_id)
      VALUES ('f40da365-2661-48da-a37b-c317c3055c52', 'e5bedc5f-67f4-4b39-9f95-26c76347fc69');
    

      INSERT INTO public.workspace_members (workspace_id, user_id)
      VALUES ('f40da365-2661-48da-a37b-c317c3055c52', '9f5a3c50-b2c3-4551-8752-e253ff1a5d31');
    

      INSERT INTO public.workspace_members (workspace_id, user_id)
      VALUES ('f40da365-2661-48da-a37b-c317c3055c52', '6ba41291-b106-4c1c-b817-d54571d2a28b');
    

      INSERT INTO public.workspace_members (workspace_id, user_id)
      VALUES ('f40da365-2661-48da-a37b-c317c3055c52', '060ea3fe-86cd-497b-8349-5de9769b0082');
    

      INSERT INTO public.workspace_members (workspace_id, user_id)
      VALUES ('f40da365-2661-48da-a37b-c317c3055c52', 'ef117e44-2249-4414-a939-a033e08c1335');
    

      INSERT INTO public.workspace_members (workspace_id, user_id)
      VALUES ('a5bc9e11-50a4-4bfa-bb12-a305ef3ba0ef', 'e5bedc5f-67f4-4b39-9f95-26c76347fc69');
    

      INSERT INTO public.workspace_members (workspace_id, user_id)
      VALUES ('a5bc9e11-50a4-4bfa-bb12-a305ef3ba0ef', '9f5a3c50-b2c3-4551-8752-e253ff1a5d31');
    

      INSERT INTO public.workspace_members (workspace_id, user_id)
      VALUES ('a5bc9e11-50a4-4bfa-bb12-a305ef3ba0ef', '6ba41291-b106-4c1c-b817-d54571d2a28b');
    

      INSERT INTO public.workspace_members (workspace_id, user_id)
      VALUES ('a5bc9e11-50a4-4bfa-bb12-a305ef3ba0ef', '060ea3fe-86cd-497b-8349-5de9769b0082');
    

      INSERT INTO public.workspace_members (workspace_id, user_id)
      VALUES ('a5bc9e11-50a4-4bfa-bb12-a305ef3ba0ef', 'ef117e44-2249-4414-a939-a033e08c1335');
    

      INSERT INTO public.workspace_members (workspace_id, user_id)
      VALUES ('a5bc9e11-50a4-4bfa-bb12-a305ef3ba0ef', '12dbeda9-5270-4e01-8338-44e1661c2585');
    

      INSERT INTO public.workspace_members (workspace_id, user_id)
      VALUES ('a5bc9e11-50a4-4bfa-bb12-a305ef3ba0ef', '4327986b-6f1d-4980-8f8c-76205d0fb110');
    

      INSERT INTO public.workspace_members (workspace_id, user_id)
      VALUES ('a5bc9e11-50a4-4bfa-bb12-a305ef3ba0ef', '597e989d-1906-40a6-89d5-d467f55cbc66');
    

      INSERT INTO public.workspace_members (workspace_id, user_id)
      VALUES ('a5bc9e11-50a4-4bfa-bb12-a305ef3ba0ef', '44d2fa67-db3c-4532-a5a6-198db1e881ca');
    

      INSERT INTO public.workspace_members (workspace_id, user_id)
      VALUES ('a5bc9e11-50a4-4bfa-bb12-a305ef3ba0ef', '4066bbbe-6e0e-422f-92c1-a7853a11019b');
    

-- Create channels

      INSERT INTO public.channels (id, workspace_id, name)
      VALUES ('73e52b2a-0c41-4a7a-82b6-aa3f0e3f3014', 'f40da365-2661-48da-a37b-c317c3055c52', 'cool designers');
    

      INSERT INTO public.channels (id, workspace_id, name)
      VALUES ('68b82493-8c17-4069-8b1b-fbb9dbbd4393', 'f40da365-2661-48da-a37b-c317c3055c52', 'uncool designers');
    

      INSERT INTO public.channels (id, workspace_id, name)
      VALUES ('0730c200-fad7-4418-a7f0-dd8fb8594fe8', 'a5bc9e11-50a4-4bfa-bb12-a305ef3ba0ef', 'hardcore engineers');
    

      INSERT INTO public.channels (id, workspace_id, name)
      VALUES ('c604d89a-9695-4060-8a0b-97981f75d907', 'a5bc9e11-50a4-4bfa-bb12-a305ef3ba0ef', 'softy engineers');
    

-- Create channel messages

        INSERT INTO public.messages (id, content, user_id, channel_id, created_at)
        VALUES (
          '7ebb38a9-cd0f-4a06-bd3f-d15b1c942c9d',
          'Hey cool designers! What''s the latest trend?',
          '67cb4ce4-92dc-431a-a33b-d4d653cb6723',
          '73e52b2a-0c41-4a7a-82b6-aa3f0e3f3014',
          '2025-01-08T06:46:32.702Z'
        );
      

        INSERT INTO public.messages (id, content, user_id, channel_id, created_at)
        VALUES (
          '528c5d0c-532e-4432-b124-282fe84bbe2e',
          'Neumorphism is making a comeback!',
          '806cfcd5-efc7-4651-9729-77a121eef3e8',
          '73e52b2a-0c41-4a7a-82b6-aa3f0e3f3014',
          '2025-01-11T13:47:55.498Z'
        );
      

        INSERT INTO public.messages (id, content, user_id, channel_id, created_at)
        VALUES (
          '14562f85-2f6f-4244-8262-08d360bf5142',
          'I thought we all agreed never to speak of that again...',
          '3fd95927-1a76-4f09-a66b-448b72658deb',
          '73e52b2a-0c41-4a7a-82b6-aa3f0e3f3014',
          '2025-01-05T23:38:31.288Z'
        );
      

        INSERT INTO public.messages (id, content, user_id, channel_id, created_at)
        VALUES (
          '008d3039-53a6-4243-a720-29eee1851328',
          'Is comic sans still cool?',
          '443357eb-7e6a-47da-a7da-a19b9585d512',
          '68b82493-8c17-4069-8b1b-fbb9dbbd4393',
          '2025-01-07T14:03:37.640Z'
        );
      

        INSERT INTO public.messages (id, content, user_id, channel_id, created_at)
        VALUES (
          '552e3c55-6acf-4f99-8f6a-65dcaf46495d',
          'It never was, dianaprince.',
          '6ba3bace-ad2a-4339-b736-b5c61ec15820',
          '68b82493-8c17-4069-8b1b-fbb9dbbd4393',
          '2025-01-09T02:01:25.415Z'
        );
      

        INSERT INTO public.messages (id, content, user_id, channel_id, created_at)
        VALUES (
          'fa589563-c5d2-4c8c-86f4-57b084b178ca',
          'Hey, be nice! We''re all learning here.',
          'e5bedc5f-67f4-4b39-9f95-26c76347fc69',
          '68b82493-8c17-4069-8b1b-fbb9dbbd4393',
          '2025-01-08T01:42:23.130Z'
        );
      

        INSERT INTO public.messages (id, content, user_id, channel_id, created_at)
        VALUES (
          '8397b6d7-4198-447a-bbcf-9a72f0cc2a26',
          'Who''s up for a 48-hour hackathon?',
          '9f5a3c50-b2c3-4551-8752-e253ff1a5d31',
          '0730c200-fad7-4418-a7f0-dd8fb8594fe8',
          '2025-01-10T09:58:51.844Z'
        );
      

        INSERT INTO public.messages (id, content, user_id, channel_id, created_at)
        VALUES (
          'c32b60ed-954e-4fc9-bbec-6720ceeb3feb',
          'I''m in! Let''s build a blockchain for pet rocks!',
          '6ba41291-b106-4c1c-b817-d54571d2a28b',
          '0730c200-fad7-4418-a7f0-dd8fb8594fe8',
          '2025-01-09T20:26:41.669Z'
        );
      

        INSERT INTO public.messages (id, content, user_id, channel_id, created_at)
        VALUES (
          '28b92a0a-ad4a-4633-8855-6a14582f1631',
          'You two need sleep. And therapy.',
          '060ea3fe-86cd-497b-8349-5de9769b0082',
          '0730c200-fad7-4418-a7f0-dd8fb8594fe8',
          '2025-01-11T17:47:24.325Z'
        );
      

        INSERT INTO public.messages (id, content, user_id, channel_id, created_at)
        VALUES (
          'b7a6ca3f-b1f7-4f8b-acfa-fa0ffc82eb67',
          'Has anyone tried coding with a nice cup of tea?',
          'ef117e44-2249-4414-a939-a033e08c1335',
          'c604d89a-9695-4060-8a0b-97981f75d907',
          '2025-01-12T15:17:05.750Z'
        );
      

        INSERT INTO public.messages (id, content, user_id, channel_id, created_at)
        VALUES (
          'dee0a9ef-2573-4cae-9067-8ef0594be963',
          'Tea? I prefer a warm glass of milk and a bedtime story.',
          '12dbeda9-5270-4e01-8338-44e1661c2585',
          'c604d89a-9695-4060-8a0b-97981f75d907',
          '2025-01-09T01:22:16.043Z'
        );
      

        INSERT INTO public.messages (id, content, user_id, channel_id, created_at)
        VALUES (
          '3c9f6139-a48c-4317-83ad-651a44c5e940',
          'You''re all adorable. Pass the cookies, please.',
          '4327986b-6f1d-4980-8f8c-76205d0fb110',
          'c604d89a-9695-4060-8a0b-97981f75d907',
          '2025-01-12T16:17:46.816Z'
        );
      

-- Create DMs and their messages

      INSERT INTO public.direct_messages (id, workspace_id)
      VALUES ('8a6b53b8-f84d-4df2-95cf-37910cf1d5c9', 'f40da365-2661-48da-a37b-c317c3055c52');
    

        INSERT INTO public.direct_message_participants (dm_id, user_id)
        VALUES ('8a6b53b8-f84d-4df2-95cf-37910cf1d5c9', '67cb4ce4-92dc-431a-a33b-d4d653cb6723');
      

        INSERT INTO public.direct_message_participants (dm_id, user_id)
        VALUES ('8a6b53b8-f84d-4df2-95cf-37910cf1d5c9', '806cfcd5-efc7-4651-9729-77a121eef3e8');
      

        INSERT INTO public.messages (id, content, user_id, dm_id, created_at)
        VALUES (
          '5975ec6a-d059-4abb-bcb1-66eec709633a',
          'Hey, got a minute?',
          '67cb4ce4-92dc-431a-a33b-d4d653cb6723',
          '8a6b53b8-f84d-4df2-95cf-37910cf1d5c9',
          '2025-01-10T08:53:21.617Z'
        );
      

        INSERT INTO public.messages (id, content, user_id, dm_id, created_at)
        VALUES (
          'd8072867-1042-4133-85f6-88998422f6e9',
          'Sure, what''s up?',
          '806cfcd5-efc7-4651-9729-77a121eef3e8',
          '8a6b53b8-f84d-4df2-95cf-37910cf1d5c9',
          '2025-01-07T03:19:28.088Z'
        );
      

        INSERT INTO public.messages (id, content, user_id, dm_id, created_at)
        VALUES (
          'bc5106c6-30ee-4b3b-8980-8da29adefdc6',
          'I need your opinion on this new design/code I''m working on.',
          '67cb4ce4-92dc-431a-a33b-d4d653cb6723',
          '8a6b53b8-f84d-4df2-95cf-37910cf1d5c9',
          '2025-01-11T11:59:30.501Z'
        );
      

        INSERT INTO public.messages (id, content, user_id, dm_id, created_at)
        VALUES (
          '00220383-6747-4ceb-bc39-c3ac3be0a02a',
          'Of course! Send it over and I''ll take a look.',
          '806cfcd5-efc7-4651-9729-77a121eef3e8',
          '8a6b53b8-f84d-4df2-95cf-37910cf1d5c9',
          '2025-01-11T21:07:41.779Z'
        );
      

      INSERT INTO public.direct_messages (id, workspace_id)
      VALUES ('5cb3154e-d704-4acb-9461-d14bbdb6e1bd', 'f40da365-2661-48da-a37b-c317c3055c52');
    

        INSERT INTO public.direct_message_participants (dm_id, user_id)
        VALUES ('5cb3154e-d704-4acb-9461-d14bbdb6e1bd', '67cb4ce4-92dc-431a-a33b-d4d653cb6723');
      

        INSERT INTO public.direct_message_participants (dm_id, user_id)
        VALUES ('5cb3154e-d704-4acb-9461-d14bbdb6e1bd', '3fd95927-1a76-4f09-a66b-448b72658deb');
      

        INSERT INTO public.messages (id, content, user_id, dm_id, created_at)
        VALUES (
          '430eb59c-0147-4788-b432-3d4f1c8a4bca',
          'Hey, got a minute?',
          '67cb4ce4-92dc-431a-a33b-d4d653cb6723',
          '5cb3154e-d704-4acb-9461-d14bbdb6e1bd',
          '2025-01-07T09:06:13.049Z'
        );
      

        INSERT INTO public.messages (id, content, user_id, dm_id, created_at)
        VALUES (
          'e63ff53a-8ae8-4e00-81d8-2c24e2ffc461',
          'Sure, what''s up?',
          '3fd95927-1a76-4f09-a66b-448b72658deb',
          '5cb3154e-d704-4acb-9461-d14bbdb6e1bd',
          '2025-01-10T21:03:35.142Z'
        );
      

        INSERT INTO public.messages (id, content, user_id, dm_id, created_at)
        VALUES (
          'fc6725f9-0efb-4c4d-aa86-d2bd626f1b2b',
          'I need your opinion on this new design/code I''m working on.',
          '67cb4ce4-92dc-431a-a33b-d4d653cb6723',
          '5cb3154e-d704-4acb-9461-d14bbdb6e1bd',
          '2025-01-10T22:08:01.973Z'
        );
      

        INSERT INTO public.messages (id, content, user_id, dm_id, created_at)
        VALUES (
          'c9bd637a-cba0-4b8b-986f-09c6ddd74cc4',
          'Of course! Send it over and I''ll take a look.',
          '3fd95927-1a76-4f09-a66b-448b72658deb',
          '5cb3154e-d704-4acb-9461-d14bbdb6e1bd',
          '2025-01-12T18:26:19.573Z'
        );
      

      INSERT INTO public.direct_messages (id, workspace_id)
      VALUES ('cfff2d0d-d517-485d-8df2-1f7896e0b858', 'f40da365-2661-48da-a37b-c317c3055c52');
    

        INSERT INTO public.direct_message_participants (dm_id, user_id)
        VALUES ('cfff2d0d-d517-485d-8df2-1f7896e0b858', '806cfcd5-efc7-4651-9729-77a121eef3e8');
      

        INSERT INTO public.direct_message_participants (dm_id, user_id)
        VALUES ('cfff2d0d-d517-485d-8df2-1f7896e0b858', '3fd95927-1a76-4f09-a66b-448b72658deb');
      

        INSERT INTO public.messages (id, content, user_id, dm_id, created_at)
        VALUES (
          '8bc86995-eedd-4c88-8dfd-560215a8b248',
          'Hey, got a minute?',
          '806cfcd5-efc7-4651-9729-77a121eef3e8',
          'cfff2d0d-d517-485d-8df2-1f7896e0b858',
          '2025-01-10T13:16:13.759Z'
        );
      

        INSERT INTO public.messages (id, content, user_id, dm_id, created_at)
        VALUES (
          '2ac78660-a036-4473-9ef9-f3eb15310492',
          'Sure, what''s up?',
          '3fd95927-1a76-4f09-a66b-448b72658deb',
          'cfff2d0d-d517-485d-8df2-1f7896e0b858',
          '2025-01-09T15:54:46.275Z'
        );
      

        INSERT INTO public.messages (id, content, user_id, dm_id, created_at)
        VALUES (
          '7a32a81f-b330-4100-a644-5d4990eb1509',
          'I need your opinion on this new design/code I''m working on.',
          '806cfcd5-efc7-4651-9729-77a121eef3e8',
          'cfff2d0d-d517-485d-8df2-1f7896e0b858',
          '2025-01-11T07:33:46.718Z'
        );
      

        INSERT INTO public.messages (id, content, user_id, dm_id, created_at)
        VALUES (
          'f732a6e9-e6c9-4368-a3e1-002d0591b4a6',
          'Of course! Send it over and I''ll take a look.',
          '3fd95927-1a76-4f09-a66b-448b72658deb',
          'cfff2d0d-d517-485d-8df2-1f7896e0b858',
          '2025-01-09T17:08:00.942Z'
        );
      

      INSERT INTO public.direct_messages (id, workspace_id)
      VALUES ('66e68766-00e4-40fe-bb60-89659749f604', 'f40da365-2661-48da-a37b-c317c3055c52');
    

        INSERT INTO public.direct_message_participants (dm_id, user_id)
        VALUES ('66e68766-00e4-40fe-bb60-89659749f604', '806cfcd5-efc7-4651-9729-77a121eef3e8');
      

        INSERT INTO public.direct_message_participants (dm_id, user_id)
        VALUES ('66e68766-00e4-40fe-bb60-89659749f604', '443357eb-7e6a-47da-a7da-a19b9585d512');
      

        INSERT INTO public.messages (id, content, user_id, dm_id, created_at)
        VALUES (
          '1e330338-e6c7-429b-8fec-b3e5fd9e25f2',
          'Hey, got a minute?',
          '806cfcd5-efc7-4651-9729-77a121eef3e8',
          '66e68766-00e4-40fe-bb60-89659749f604',
          '2025-01-07T12:19:17.708Z'
        );
      

        INSERT INTO public.messages (id, content, user_id, dm_id, created_at)
        VALUES (
          '6b62fa2c-1026-431e-b1af-cf8faf2df5c8',
          'Sure, what''s up?',
          '443357eb-7e6a-47da-a7da-a19b9585d512',
          '66e68766-00e4-40fe-bb60-89659749f604',
          '2025-01-10T15:40:59.677Z'
        );
      

        INSERT INTO public.messages (id, content, user_id, dm_id, created_at)
        VALUES (
          'a1301e79-b2d6-4ad4-ad60-b7afa74f8463',
          'I need your opinion on this new design/code I''m working on.',
          '806cfcd5-efc7-4651-9729-77a121eef3e8',
          '66e68766-00e4-40fe-bb60-89659749f604',
          '2025-01-07T14:03:07.387Z'
        );
      

        INSERT INTO public.messages (id, content, user_id, dm_id, created_at)
        VALUES (
          '55175a73-cf58-4cab-9f87-9ec696595424',
          'Of course! Send it over and I''ll take a look.',
          '443357eb-7e6a-47da-a7da-a19b9585d512',
          '66e68766-00e4-40fe-bb60-89659749f604',
          '2025-01-07T08:27:29.492Z'
        );
      

      INSERT INTO public.direct_messages (id, workspace_id)
      VALUES ('a4eec153-4c12-4c6b-ba56-c8b22803a246', 'f40da365-2661-48da-a37b-c317c3055c52');
    

        INSERT INTO public.direct_message_participants (dm_id, user_id)
        VALUES ('a4eec153-4c12-4c6b-ba56-c8b22803a246', '3fd95927-1a76-4f09-a66b-448b72658deb');
      

        INSERT INTO public.direct_message_participants (dm_id, user_id)
        VALUES ('a4eec153-4c12-4c6b-ba56-c8b22803a246', '443357eb-7e6a-47da-a7da-a19b9585d512');
      

        INSERT INTO public.messages (id, content, user_id, dm_id, created_at)
        VALUES (
          '97107e18-fe8d-4874-bb53-7e1d3e226c76',
          'Hey, got a minute?',
          '3fd95927-1a76-4f09-a66b-448b72658deb',
          'a4eec153-4c12-4c6b-ba56-c8b22803a246',
          '2025-01-10T16:04:13.978Z'
        );
      

        INSERT INTO public.messages (id, content, user_id, dm_id, created_at)
        VALUES (
          '0b64e27f-4754-4db1-a748-0b170e8ec409',
          'Sure, what''s up?',
          '443357eb-7e6a-47da-a7da-a19b9585d512',
          'a4eec153-4c12-4c6b-ba56-c8b22803a246',
          '2025-01-09T03:18:23.977Z'
        );
      

        INSERT INTO public.messages (id, content, user_id, dm_id, created_at)
        VALUES (
          'f1cfe466-64a9-43a8-9eeb-9af1431a282c',
          'I need your opinion on this new design/code I''m working on.',
          '3fd95927-1a76-4f09-a66b-448b72658deb',
          'a4eec153-4c12-4c6b-ba56-c8b22803a246',
          '2025-01-12T08:40:34.246Z'
        );
      

        INSERT INTO public.messages (id, content, user_id, dm_id, created_at)
        VALUES (
          '7a5ff61e-3cc0-49ed-9920-b8a0b896ced9',
          'Of course! Send it over and I''ll take a look.',
          '443357eb-7e6a-47da-a7da-a19b9585d512',
          'a4eec153-4c12-4c6b-ba56-c8b22803a246',
          '2025-01-11T11:14:01.537Z'
        );
      

      INSERT INTO public.direct_messages (id, workspace_id)
      VALUES ('280a8afa-1e2b-4723-abee-155806ba574b', 'f40da365-2661-48da-a37b-c317c3055c52');
    

        INSERT INTO public.direct_message_participants (dm_id, user_id)
        VALUES ('280a8afa-1e2b-4723-abee-155806ba574b', '443357eb-7e6a-47da-a7da-a19b9585d512');
      

        INSERT INTO public.direct_message_participants (dm_id, user_id)
        VALUES ('280a8afa-1e2b-4723-abee-155806ba574b', '6ba3bace-ad2a-4339-b736-b5c61ec15820');
      

        INSERT INTO public.messages (id, content, user_id, dm_id, created_at)
        VALUES (
          '7813f8c4-fdb1-49d2-8191-a548b57c7888',
          'Hey, got a minute?',
          '443357eb-7e6a-47da-a7da-a19b9585d512',
          '280a8afa-1e2b-4723-abee-155806ba574b',
          '2025-01-10T05:50:35.342Z'
        );
      

        INSERT INTO public.messages (id, content, user_id, dm_id, created_at)
        VALUES (
          '137c1713-bb66-4936-885d-ae29162ea873',
          'Sure, what''s up?',
          '6ba3bace-ad2a-4339-b736-b5c61ec15820',
          '280a8afa-1e2b-4723-abee-155806ba574b',
          '2025-01-09T17:55:43.638Z'
        );
      

        INSERT INTO public.messages (id, content, user_id, dm_id, created_at)
        VALUES (
          'd61e4ba8-2316-4cd9-912f-57984ac50b6f',
          'I need your opinion on this new design/code I''m working on.',
          '443357eb-7e6a-47da-a7da-a19b9585d512',
          '280a8afa-1e2b-4723-abee-155806ba574b',
          '2025-01-11T06:06:19.799Z'
        );
      

        INSERT INTO public.messages (id, content, user_id, dm_id, created_at)
        VALUES (
          '350701d6-09b7-4209-95ed-fee4b8d7776d',
          'Of course! Send it over and I''ll take a look.',
          '6ba3bace-ad2a-4339-b736-b5c61ec15820',
          '280a8afa-1e2b-4723-abee-155806ba574b',
          '2025-01-08T00:59:28.677Z'
        );
      

      INSERT INTO public.direct_messages (id, workspace_id)
      VALUES ('823011fd-44a9-45bd-85b0-53f78d87a968', 'a5bc9e11-50a4-4bfa-bb12-a305ef3ba0ef');
    

        INSERT INTO public.direct_message_participants (dm_id, user_id)
        VALUES ('823011fd-44a9-45bd-85b0-53f78d87a968', 'e5bedc5f-67f4-4b39-9f95-26c76347fc69');
      

        INSERT INTO public.direct_message_participants (dm_id, user_id)
        VALUES ('823011fd-44a9-45bd-85b0-53f78d87a968', '9f5a3c50-b2c3-4551-8752-e253ff1a5d31');
      

        INSERT INTO public.messages (id, content, user_id, dm_id, created_at)
        VALUES (
          '2c1d15ae-4603-4441-8e8d-8826094f601d',
          'Hey, got a minute?',
          'e5bedc5f-67f4-4b39-9f95-26c76347fc69',
          '823011fd-44a9-45bd-85b0-53f78d87a968',
          '2025-01-07T09:38:51.237Z'
        );
      

        INSERT INTO public.messages (id, content, user_id, dm_id, created_at)
        VALUES (
          '0d3ef1d1-6288-4cd0-b37d-1493a2c8cbf5',
          'Sure, what''s up?',
          '9f5a3c50-b2c3-4551-8752-e253ff1a5d31',
          '823011fd-44a9-45bd-85b0-53f78d87a968',
          '2025-01-10T17:02:41.089Z'
        );
      

        INSERT INTO public.messages (id, content, user_id, dm_id, created_at)
        VALUES (
          'fa21d9a2-8199-4e8a-ab61-0b388a9e370f',
          'I need your opinion on this new design/code I''m working on.',
          'e5bedc5f-67f4-4b39-9f95-26c76347fc69',
          '823011fd-44a9-45bd-85b0-53f78d87a968',
          '2025-01-06T21:23:15.235Z'
        );
      

        INSERT INTO public.messages (id, content, user_id, dm_id, created_at)
        VALUES (
          '8b45ca77-6fae-4872-8f7b-e4a42c7e3bd6',
          'Of course! Send it over and I''ll take a look.',
          '9f5a3c50-b2c3-4551-8752-e253ff1a5d31',
          '823011fd-44a9-45bd-85b0-53f78d87a968',
          '2025-01-05T22:10:10.663Z'
        );
      

      INSERT INTO public.direct_messages (id, workspace_id)
      VALUES ('ffeb2f40-f268-4468-8ebf-89b3a6667b00', 'a5bc9e11-50a4-4bfa-bb12-a305ef3ba0ef');
    

        INSERT INTO public.direct_message_participants (dm_id, user_id)
        VALUES ('ffeb2f40-f268-4468-8ebf-89b3a6667b00', 'e5bedc5f-67f4-4b39-9f95-26c76347fc69');
      

        INSERT INTO public.direct_message_participants (dm_id, user_id)
        VALUES ('ffeb2f40-f268-4468-8ebf-89b3a6667b00', '6ba41291-b106-4c1c-b817-d54571d2a28b');
      

        INSERT INTO public.messages (id, content, user_id, dm_id, created_at)
        VALUES (
          '1dc9dff7-2198-41aa-9612-19c32b3a824a',
          'Hey, got a minute?',
          'e5bedc5f-67f4-4b39-9f95-26c76347fc69',
          'ffeb2f40-f268-4468-8ebf-89b3a6667b00',
          '2025-01-09T13:53:25.286Z'
        );
      

        INSERT INTO public.messages (id, content, user_id, dm_id, created_at)
        VALUES (
          '67c6afcc-f99e-4c20-9b01-0c4d06caee4d',
          'Sure, what''s up?',
          '6ba41291-b106-4c1c-b817-d54571d2a28b',
          'ffeb2f40-f268-4468-8ebf-89b3a6667b00',
          '2025-01-05T22:41:46.155Z'
        );
      

        INSERT INTO public.messages (id, content, user_id, dm_id, created_at)
        VALUES (
          '6d74f213-d438-4c8c-975a-097d7837457a',
          'I need your opinion on this new design/code I''m working on.',
          'e5bedc5f-67f4-4b39-9f95-26c76347fc69',
          'ffeb2f40-f268-4468-8ebf-89b3a6667b00',
          '2025-01-12T05:04:22.061Z'
        );
      

        INSERT INTO public.messages (id, content, user_id, dm_id, created_at)
        VALUES (
          'e5e57dc2-87ae-4b91-9e2b-21254387c092',
          'Of course! Send it over and I''ll take a look.',
          '6ba41291-b106-4c1c-b817-d54571d2a28b',
          'ffeb2f40-f268-4468-8ebf-89b3a6667b00',
          '2025-01-05T20:41:36.820Z'
        );
      

      INSERT INTO public.direct_messages (id, workspace_id)
      VALUES ('3e262fc1-6a26-4dd8-8b76-918cad368e3a', 'a5bc9e11-50a4-4bfa-bb12-a305ef3ba0ef');
    

        INSERT INTO public.direct_message_participants (dm_id, user_id)
        VALUES ('3e262fc1-6a26-4dd8-8b76-918cad368e3a', '9f5a3c50-b2c3-4551-8752-e253ff1a5d31');
      

        INSERT INTO public.direct_message_participants (dm_id, user_id)
        VALUES ('3e262fc1-6a26-4dd8-8b76-918cad368e3a', '6ba41291-b106-4c1c-b817-d54571d2a28b');
      

        INSERT INTO public.messages (id, content, user_id, dm_id, created_at)
        VALUES (
          '5a09ff7c-87bd-4ad1-a6e6-b251a73ccf1a',
          'Hey, got a minute?',
          '9f5a3c50-b2c3-4551-8752-e253ff1a5d31',
          '3e262fc1-6a26-4dd8-8b76-918cad368e3a',
          '2025-01-08T00:43:57.350Z'
        );
      

        INSERT INTO public.messages (id, content, user_id, dm_id, created_at)
        VALUES (
          '4d494d38-e1f1-4386-b9f6-449337fbb65b',
          'Sure, what''s up?',
          '6ba41291-b106-4c1c-b817-d54571d2a28b',
          '3e262fc1-6a26-4dd8-8b76-918cad368e3a',
          '2025-01-08T17:53:30.378Z'
        );
      

        INSERT INTO public.messages (id, content, user_id, dm_id, created_at)
        VALUES (
          'bac044cd-4550-4419-a226-deda35b27301',
          'I need your opinion on this new design/code I''m working on.',
          '9f5a3c50-b2c3-4551-8752-e253ff1a5d31',
          '3e262fc1-6a26-4dd8-8b76-918cad368e3a',
          '2025-01-07T21:58:04.903Z'
        );
      

        INSERT INTO public.messages (id, content, user_id, dm_id, created_at)
        VALUES (
          'bef9303f-6ffb-4463-a3b9-640d55bc5abf',
          'Of course! Send it over and I''ll take a look.',
          '6ba41291-b106-4c1c-b817-d54571d2a28b',
          '3e262fc1-6a26-4dd8-8b76-918cad368e3a',
          '2025-01-10T15:53:38.760Z'
        );
      

      INSERT INTO public.direct_messages (id, workspace_id)
      VALUES ('32d07fcb-3b36-40a9-9967-dbd69b1d62ee', 'a5bc9e11-50a4-4bfa-bb12-a305ef3ba0ef');
    

        INSERT INTO public.direct_message_participants (dm_id, user_id)
        VALUES ('32d07fcb-3b36-40a9-9967-dbd69b1d62ee', '9f5a3c50-b2c3-4551-8752-e253ff1a5d31');
      

        INSERT INTO public.direct_message_participants (dm_id, user_id)
        VALUES ('32d07fcb-3b36-40a9-9967-dbd69b1d62ee', '060ea3fe-86cd-497b-8349-5de9769b0082');
      

        INSERT INTO public.messages (id, content, user_id, dm_id, created_at)
        VALUES (
          'fa845677-67f2-42a1-8216-3838f8150398',
          'Hey, got a minute?',
          '9f5a3c50-b2c3-4551-8752-e253ff1a5d31',
          '32d07fcb-3b36-40a9-9967-dbd69b1d62ee',
          '2025-01-11T14:50:04.556Z'
        );
      

        INSERT INTO public.messages (id, content, user_id, dm_id, created_at)
        VALUES (
          'f318f514-96c7-4a6b-864d-10523ebdfb34',
          'Sure, what''s up?',
          '060ea3fe-86cd-497b-8349-5de9769b0082',
          '32d07fcb-3b36-40a9-9967-dbd69b1d62ee',
          '2025-01-11T01:12:36.199Z'
        );
      

        INSERT INTO public.messages (id, content, user_id, dm_id, created_at)
        VALUES (
          '10578876-ffd0-423a-ba06-2260c7dc6640',
          'I need your opinion on this new design/code I''m working on.',
          '9f5a3c50-b2c3-4551-8752-e253ff1a5d31',
          '32d07fcb-3b36-40a9-9967-dbd69b1d62ee',
          '2025-01-11T15:11:56.676Z'
        );
      

        INSERT INTO public.messages (id, content, user_id, dm_id, created_at)
        VALUES (
          '41dc067d-52f3-42e0-935b-bc2b383a90d4',
          'Of course! Send it over and I''ll take a look.',
          '060ea3fe-86cd-497b-8349-5de9769b0082',
          '32d07fcb-3b36-40a9-9967-dbd69b1d62ee',
          '2025-01-11T08:23:30.299Z'
        );
      

      INSERT INTO public.direct_messages (id, workspace_id)
      VALUES ('0b7096c5-4574-4cb3-b930-d05dfb569194', 'a5bc9e11-50a4-4bfa-bb12-a305ef3ba0ef');
    

        INSERT INTO public.direct_message_participants (dm_id, user_id)
        VALUES ('0b7096c5-4574-4cb3-b930-d05dfb569194', '6ba41291-b106-4c1c-b817-d54571d2a28b');
      

        INSERT INTO public.direct_message_participants (dm_id, user_id)
        VALUES ('0b7096c5-4574-4cb3-b930-d05dfb569194', '060ea3fe-86cd-497b-8349-5de9769b0082');
      

        INSERT INTO public.messages (id, content, user_id, dm_id, created_at)
        VALUES (
          '73e6553f-a589-4c58-9310-8f5bdd20546b',
          'Hey, got a minute?',
          '6ba41291-b106-4c1c-b817-d54571d2a28b',
          '0b7096c5-4574-4cb3-b930-d05dfb569194',
          '2025-01-06T19:27:00.068Z'
        );
      

        INSERT INTO public.messages (id, content, user_id, dm_id, created_at)
        VALUES (
          '5e35d220-d32c-4887-8309-b478f843d3cc',
          'Sure, what''s up?',
          '060ea3fe-86cd-497b-8349-5de9769b0082',
          '0b7096c5-4574-4cb3-b930-d05dfb569194',
          '2025-01-06T02:17:07.455Z'
        );
      

        INSERT INTO public.messages (id, content, user_id, dm_id, created_at)
        VALUES (
          '21ba3e53-aec9-4f04-a8f3-c319e68fc714',
          'I need your opinion on this new design/code I''m working on.',
          '6ba41291-b106-4c1c-b817-d54571d2a28b',
          '0b7096c5-4574-4cb3-b930-d05dfb569194',
          '2025-01-07T05:53:42.235Z'
        );
      

        INSERT INTO public.messages (id, content, user_id, dm_id, created_at)
        VALUES (
          '8de0dbb9-d527-4325-8f13-9a470015e55b',
          'Of course! Send it over and I''ll take a look.',
          '060ea3fe-86cd-497b-8349-5de9769b0082',
          '0b7096c5-4574-4cb3-b930-d05dfb569194',
          '2025-01-06T00:48:00.387Z'
        );
      

      INSERT INTO public.direct_messages (id, workspace_id)
      VALUES ('8d26eb51-a1b3-406d-8e18-d2d51b48e9aa', 'a5bc9e11-50a4-4bfa-bb12-a305ef3ba0ef');
    

        INSERT INTO public.direct_message_participants (dm_id, user_id)
        VALUES ('8d26eb51-a1b3-406d-8e18-d2d51b48e9aa', '060ea3fe-86cd-497b-8349-5de9769b0082');
      

        INSERT INTO public.direct_message_participants (dm_id, user_id)
        VALUES ('8d26eb51-a1b3-406d-8e18-d2d51b48e9aa', 'ef117e44-2249-4414-a939-a033e08c1335');
      

        INSERT INTO public.messages (id, content, user_id, dm_id, created_at)
        VALUES (
          '1b9e172b-01d8-4b09-8d9d-da733c5ba2b5',
          'Hey, got a minute?',
          '060ea3fe-86cd-497b-8349-5de9769b0082',
          '8d26eb51-a1b3-406d-8e18-d2d51b48e9aa',
          '2025-01-08T21:44:08.900Z'
        );
      

        INSERT INTO public.messages (id, content, user_id, dm_id, created_at)
        VALUES (
          'a022951a-bb76-49a8-865d-61623a462c76',
          'Sure, what''s up?',
          'ef117e44-2249-4414-a939-a033e08c1335',
          '8d26eb51-a1b3-406d-8e18-d2d51b48e9aa',
          '2025-01-07T09:16:23.943Z'
        );
      

        INSERT INTO public.messages (id, content, user_id, dm_id, created_at)
        VALUES (
          '177ace34-36a0-426a-bf51-8b04298a674b',
          'I need your opinion on this new design/code I''m working on.',
          '060ea3fe-86cd-497b-8349-5de9769b0082',
          '8d26eb51-a1b3-406d-8e18-d2d51b48e9aa',
          '2025-01-07T07:53:51.721Z'
        );
      

        INSERT INTO public.messages (id, content, user_id, dm_id, created_at)
        VALUES (
          '1836709a-ae94-409f-80fa-7701579600b7',
          'Of course! Send it over and I''ll take a look.',
          'ef117e44-2249-4414-a939-a033e08c1335',
          '8d26eb51-a1b3-406d-8e18-d2d51b48e9aa',
          '2025-01-09T00:39:55.081Z'
        );
      

-- Re-enable triggers
ALTER TABLE auth.users ENABLE TRIGGER ALL;
ALTER TABLE public.profiles ENABLE TRIGGER ALL;
ALTER TABLE public.workspaces ENABLE TRIGGER ALL;
ALTER TABLE public.workspace_members ENABLE TRIGGER ALL;
ALTER TABLE public.channels ENABLE TRIGGER ALL;
ALTER TABLE public.messages ENABLE TRIGGER ALL;
ALTER TABLE public.direct_messages ENABLE TRIGGER ALL;
ALTER TABLE public.direct_message_participants ENABLE TRIGGER ALL;
ALTER TABLE public.reactions ENABLE TRIGGER ALL;
