import json

from channels.generic.websocket import AsyncWebsocketConsumer
from django.core.exceptions import ObjectDoesNotExist
from asgiref.sync import sync_to_async
from .models import (
    User,
    Room,
    UserRoom,
    Message)


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.room_group_name = "chat_"+self.room_name
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        # print(data)
        message = data['message']
        username = data['username']
        roomname = data['roomname']

        await self.save_message(username, roomname, message)

        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'username': username,
                'roomname': roomname
            }
        )

    async def chat_message(self, event):
        message = event['message']
        username = event['username']
        roomname = event['roomname']

        await self.send(text_data=json.dumps({
            'message': message,
            'username': username,
            'roomname': roomname
        }))

    @sync_to_async
    def save_message(self, username, roomname, message):
        user = User.objects.get(name=username)
        room = None
        try:
            room = Room.objects.get(slug=roomname)
        except ObjectDoesNotExist:
            room = Room.objects.create(slug=roomname)
            print(self.room_name, " added")

        try:
            UserRoom.objects.get(user=user, room=room)
        except ObjectDoesNotExist:
            UserRoom.objects.create(user=user, room=room)
        Message.objects.create(user=user, room=room, content=message)
