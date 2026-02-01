import axios from 'axios';
import { config } from '../config';
import prisma from '../config/database';

interface DiscordWebhookPayload {
  content?: string;
  embeds?: Array<{
    title?: string;
    description?: string;
    color?: number;
    fields?: Array<{
      name: string;
      value: string;
      inline?: boolean;
    }>;
    timestamp?: string;
  }>;
}

export class DiscordService {
  private static getWebhookUrl(type: 'general' | 'admin' | 'pro' | 'ctf'): string | undefined {
    switch (type) {
      case 'general':
        return config.discord.webhookGeneral;
      case 'admin':
        return config.discord.webhookAdmin;
      case 'pro':
        return config.discord.webhookPro;
      case 'ctf':
        return config.discord.webhookCtf;
      default:
        return undefined;
    }
  }

  private static async sendWebhook(
    type: 'general' | 'admin' | 'pro' | 'ctf',
    payload: DiscordWebhookPayload
  ): Promise<boolean> {
    const webhookUrl = this.getWebhookUrl(type);
    
    if (!webhookUrl) {
      console.warn(`Discord webhook ${type} not configured`);
      return false;
    }

    try {
      await axios.post(webhookUrl, payload);
      return true;
    } catch (error) {
      console.error(`Error sending Discord webhook ${type}:`, error);
      return false;
    }
  }

  // New User Registration
  static async notifyNewUser(username: string, email: string, provider: string) {
    const payload: DiscordWebhookPayload = {
      embeds: [{
        title: '✅ Nouvel Utilisateur',
        description: `Un nouveau membre a rejoint la plateforme !`,
        color: 0x00ff00,
        fields: [
          { name: 'Username', value: username, inline: true },
          { name: 'Email', value: email, inline: true },
          { name: 'Provider', value: provider, inline: true },
        ],
        timestamp: new Date().toISOString(),
      }],
    };

    const success = await this.sendWebhook('general', payload);
    
    await prisma.discordNotification.updateMany({
      where: {
        webhookType: 'general',
        event: 'new_user',
        status: 'pending',
        payload: { path: ['username'], equals: username },
      },
      data: {
        status: success ? 'sent' : 'failed',
        sentAt: success ? new Date() : null,
        error: success ? null : 'Failed to send webhook',
      },
    });
  }

  // Role Change
  static async notifyRoleChange(username: string, oldRole: string, newRole: string, changedBy: string) {
    const payload: DiscordWebhookPayload = {
      embeds: [{
        title: '🎭 Changement de Rôle',
        description: `Le rôle d'un utilisateur a été modifié`,
        color: 0xffa500,
        fields: [
          { name: 'Utilisateur', value: username, inline: true },
          { name: 'Ancien Rôle', value: oldRole, inline: true },
          { name: 'Nouveau Rôle', value: newRole, inline: true },
          { name: 'Modifié par', value: changedBy, inline: false },
        ],
        timestamp: new Date().toISOString(),
      }],
    };

    await this.sendWebhook('admin', payload);
  }

  // PRO Access Activated
  static async notifyProAccess(username: string, proType: 'dev' | 'gaming') {
    const payload: DiscordWebhookPayload = {
      embeds: [{
        title: '💎 Accès PRO Activé',
        description: `Un utilisateur a obtenu l'accès PRO !`,
        color: 0x9b59b6,
        fields: [
          { name: 'Utilisateur', value: username, inline: true },
          { name: 'Type PRO', value: proType === 'dev' ? 'PRO Dev' : 'PRO Gaming', inline: true },
        ],
        timestamp: new Date().toISOString(),
      }],
    };

    await this.sendWebhook('pro', payload);
  }

  // CTF Results
  static async notifyCTFResult(username: string, ctfName: string, score: number, rank: number) {
    const payload: DiscordWebhookPayload = {
      embeds: [{
        title: '🏆 Résultat CTF',
        description: `Nouveau résultat CTF enregistré !`,
        color: 0xf1c40f,
        fields: [
          { name: 'Utilisateur', value: username, inline: true },
          { name: 'CTF', value: ctfName, inline: true },
          { name: 'Score', value: score.toString(), inline: true },
          { name: 'Rang', value: `#${rank}`, inline: true },
        ],
        timestamp: new Date().toISOString(),
      }],
    };

    await this.sendWebhook('ctf', payload);
  }

  // Moderation Alert
  static async notifyModeration(action: string, targetUser: string, reason: string, moderator: string) {
    const payload: DiscordWebhookPayload = {
      embeds: [{
        title: '⚠️ Action de Modération',
        description: `Une action de modération a été effectuée`,
        color: 0xe74c3c,
        fields: [
          { name: 'Action', value: action, inline: true },
          { name: 'Utilisateur ciblé', value: targetUser, inline: true },
          { name: 'Modérateur', value: moderator, inline: true },
          { name: 'Raison', value: reason, inline: false },
        ],
        timestamp: new Date().toISOString(),
      }],
    };

    await this.sendWebhook('admin', payload);
  }

  // User Deactivated
  static async notifyUserDeactivated(username: string, reason: string, deactivatedBy: string) {
    const payload: DiscordWebhookPayload = {
      embeds: [{
        title: '🚫 Utilisateur Désactivé',
        description: `Un compte utilisateur a été désactivé`,
        color: 0xe74c3c,
        fields: [
          { name: 'Utilisateur', value: username, inline: true },
          { name: 'Désactivé par', value: deactivatedBy, inline: true },
          { name: 'Raison', value: reason, inline: false },
        ],
        timestamp: new Date().toISOString(),
      }],
    };

    await this.sendWebhook('admin', payload);
  }

  // Course Completed
  static async notifyCourseCompleted(username: string, courseTitle: string, xpEarned: number) {
    const payload: DiscordWebhookPayload = {
      embeds: [{
        title: '🎓 Cours Complété',
        description: `Un utilisateur a terminé un cours !`,
        color: 0x3498db,
        fields: [
          { name: 'Utilisateur', value: username, inline: true },
          { name: 'Cours', value: courseTitle, inline: true },
          { name: 'XP Gagné', value: `${xpEarned} XP`, inline: true },
        ],
        timestamp: new Date().toISOString(),
      }],
    };

    await this.sendWebhook('general', payload);
  }

  // Badge Earned
  static async notifyBadgeEarned(username: string, badgeName: string, badgeIcon: string) {
    const payload: DiscordWebhookPayload = {
      embeds: [{
        title: '🏅 Badge Obtenu',
        description: `${username} a débloqué un nouveau badge !`,
        color: 0xf39c12,
        fields: [
          { name: 'Badge', value: `${badgeIcon} ${badgeName}`, inline: false },
        ],
        timestamp: new Date().toISOString(),
      }],
    };

    await this.sendWebhook('general', payload);
  }
}
