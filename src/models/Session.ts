import mongoose from 'mongoose';

const participantSchema = new mongoose.Schema({
    id: String,
    name: String,
    role: {
        type: String,
        enum: ['host', 'member'],
        default: 'member'
    },
    joinedAt: {
        type: Date,
        default: Date.now
    }
});

const queueItemSchema = new mongoose.Schema({
    trackId: String,
    trackName: String,
    artistName: String,
    albumName: String,
    albumArt: String,
    uri: String,
    addedBy: String,
    addedAt: {
        type: Date,
        default: Date.now
    },
    position: Number
});

const currentTrackSchema = new mongoose.Schema({
    trackId: String,
    startedAt: Date,
    position: Number
});

const sessionSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true,
        unique: true
    },
    hostId: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        required: true
    },
    participants: [participantSchema],
    queue: [queueItemSchema],
    currentTrack: currentTrackSchema,
    isActive: {
        type: Boolean,
        default: true
    }
});

sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Session = mongoose.models.Session || mongoose.model('Session', sessionSchema);