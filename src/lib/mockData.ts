import { EmailTemplate, Folder, User, ApprovalRequest } from '@/types';

export const mockUser: User = {
  id: 'user_1',
  email: 'john.doe@company.com',
  name: 'John Doe',
  domain: 'marketing',
  groups: ['domain:marketing', 'role:editor', 'role:approver'],
  permissions: {
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canApprove: true,
    canBulkOperation: true,
  },
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
};

export const mockFolders: Folder[] = [
  {
    id: 'folder_1',
    domain: 'marketing',
    name: 'Welcome Series',
    createdBy: 'user_1',
    createdAt: new Date('2024-01-15'),
    templateCount: 5,
    color: '#8B5CF6'
  },
  {
    id: 'folder_2',
    domain: 'marketing',
    name: 'Product Updates',
    createdBy: 'user_1',
    createdAt: new Date('2024-01-20'),
    templateCount: 8,
    color: '#06B6D4'
  },
  {
    id: 'folder_3',
    domain: 'marketing',
    name: 'Newsletters',
    createdBy: 'user_1',
    createdAt: new Date('2024-02-01'),
    templateCount: 12,
    color: '#10B981'
  },
  {
    id: 'folder_4',
    domain: 'marketing',
    name: 'Transactional',
    createdBy: 'user_1',
    createdAt: new Date('2024-02-10'),
    templateCount: 6,
    color: '#F59E0B'
  }
];

export const mockTemplates: EmailTemplate[] = [
  {
    id: 'template_1',
    domain: 'marketing',
    folderId: 'folder_1',
    name: 'Welcome Email - New Users',
    subject: 'Welcome to {{companyName}}! Get started with these tips',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <header style="background: linear-gradient(135deg, #8B5CF6, #A855F7); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; font-size: 28px; margin: 0;">Welcome to {{companyName}}!</h1>
        </header>
        <main style="padding: 30px 20px;">
          <p style="font-size: 16px; line-height: 1.6; color: #374151;">Hi {{firstName}},</p>
          <p style="font-size: 16px; line-height: 1.6; color: #374151;">We're thrilled to have you join our community! Here are some quick tips to get you started:</p>
          <ul style="font-size: 16px; line-height: 1.8; color: #374151;">
            <li>Complete your profile to unlock all features</li>
            <li>Explore our resource center</li>
            <li>Connect with other members</li>
          </ul>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{dashboardUrl}}" style="background: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">Get Started</a>
          </div>
        </main>
        <footer style="background: #F9FAFB; padding: 20px; text-align: center; color: #6B7280; font-size: 14px;">
          <p>Questions? Reply to this email or visit our <a href="{{supportUrl}}" style="color: #8B5CF6;">help center</a></p>
        </footer>
      </div>
    `,
    plainTextContent: `Welcome to {{companyName}}!

Hi {{firstName}},

We're thrilled to have you join our community! Here are some quick tips to get you started:

• Complete your profile to unlock all features
• Explore our resource center  
• Connect with other members

Get started: {{dashboardUrl}}

Questions? Reply to this email or visit our help center: {{supportUrl}}`,
    variables: ['companyName', 'firstName', 'dashboardUrl', 'supportUrl'],
    status: 'approved',
    enabled: true,
    version: 2,
    createdBy: 'user_1',
    createdAt: new Date('2024-01-15T10:00:00Z'),
    lastModifiedBy: 'user_1',
    lastModifiedAt: new Date('2024-01-20T14:30:00Z'),
    approvedBy: 'user_2',
    approvedAt: new Date('2024-01-20T15:00:00Z'),
    tags: ['welcome', 'onboarding', 'automated']
  },
  {
    id: 'template_2',
    domain: 'marketing',
    folderId: 'folder_2',
    name: 'Product Feature Announcement',
    subject: '🚀 New Feature: {{featureName}} is here!',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <header style="background: linear-gradient(135deg, #06B6D4, #0891B2); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; font-size: 28px; margin: 0;">🚀 New Feature Release</h1>
        </header>
        <main style="padding: 30px 20px;">
          <h2 style="color: #1F2937; font-size: 24px;">Introducing {{featureName}}</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #374151;">We're excited to announce our latest feature that will help you {{featureBenefit}}.</p>
          <div style="background: #F0F9FF; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #0369A1; margin-top: 0;">Key Benefits:</h3>
            <ul style="color: #374151;">
              <li>{{benefit1}}</li>
              <li>{{benefit2}}</li>
              <li>{{benefit3}}</li>
            </ul>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{featureUrl}}" style="background: #06B6D4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">Try It Now</a>
          </div>
        </main>
      </div>
    `,
    plainTextContent: `🚀 New Feature Release

Introducing {{featureName}}

We're excited to announce our latest feature that will help you {{featureBenefit}}.

Key Benefits:
• {{benefit1}}
• {{benefit2}}
• {{benefit3}}

Try it now: {{featureUrl}}`,
    variables: ['featureName', 'featureBenefit', 'benefit1', 'benefit2', 'benefit3', 'featureUrl'],
    status: 'pending_approval',
    enabled: false,
    version: 1,
    createdBy: 'user_1',
    createdAt: new Date('2024-02-01T09:00:00Z'),
    lastModifiedBy: 'user_1',
    lastModifiedAt: new Date('2024-02-01T09:00:00Z'),
    tags: ['product', 'announcement', 'feature']
  },
  {
    id: 'template_3',
    domain: 'marketing',
    name: 'Monthly Newsletter Template',
    subject: '{{month}} Newsletter - Latest updates from {{companyName}}',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <header style="background: linear-gradient(135deg, #10B981, #059669); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; font-size: 28px; margin: 0;">{{month}} Newsletter</h1>
        </header>
        <main style="padding: 30px 20px;">
          <section style="margin-bottom: 30px;">
            <h2 style="color: #1F2937; font-size: 22px; border-bottom: 2px solid #10B981; padding-bottom: 10px;">This Month's Highlights</h2>
            <p style="font-size: 16px; line-height: 1.6; color: #374151;">{{monthlyHighlight}}</p>
          </section>
          
          <section style="margin-bottom: 30px;">
            <h2 style="color: #1F2937; font-size: 22px; border-bottom: 2px solid #10B981; padding-bottom: 10px;">Featured Articles</h2>
            <div style="background: #F0FDF4; padding: 20px; border-radius: 8px;">
              <h3 style="color: #166534; margin-top: 0;">{{articleTitle}}</h3>
              <p style="color: #374151; line-height: 1.6;">{{articleExcerpt}}</p>
              <a href="{{articleUrl}}" style="color: #10B981; font-weight: 600;">Read More →</a>
            </div>
          </section>
          
          <section style="text-align: center; margin: 30px 0;">
            <h3 style="color: #1F2937;">Stay Connected</h3>
            <div style="margin: 20px 0;">
              <a href="{{twitterUrl}}" style="margin: 0 10px; color: #10B981;">Twitter</a>
              <a href="{{linkedinUrl}}" style="margin: 0 10px; color: #10B981;">LinkedIn</a>
              <a href="{{blogUrl}}" style="margin: 0 10px; color: #10B981;">Blog</a>
            </div>
          </section>
        </main>
      </div>
    `,
    plainTextContent: `{{month}} Newsletter

This Month's Highlights
{{monthlyHighlight}}

Featured Articles
{{articleTitle}}
{{articleExcerpt}}
Read more: {{articleUrl}}

Stay Connected
Twitter: {{twitterUrl}}
LinkedIn: {{linkedinUrl}}
Blog: {{blogUrl}}`,
    variables: ['month', 'companyName', 'monthlyHighlight', 'articleTitle', 'articleExcerpt', 'articleUrl', 'twitterUrl', 'linkedinUrl', 'blogUrl'],
    status: 'draft',
    enabled: false,
    version: 1,
    createdBy: 'user_1',
    createdAt: new Date('2024-02-05T11:30:00Z'),
    lastModifiedBy: 'user_1',
    lastModifiedAt: new Date('2024-02-05T11:30:00Z'),
    tags: ['newsletter', 'monthly', 'content']
  },
  {
    id: 'template_4',
    domain: 'marketing',
    folderId: 'folder_4',
    name: 'Order Confirmation',
    subject: 'Order Confirmation #{{orderNumber}} - Thank you for your purchase!',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <header style="background: linear-gradient(135deg, #F59E0B, #D97706); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; font-size: 28px; margin: 0;">Order Confirmed!</h1>
        </header>
        <main style="padding: 30px 20px;">
          <p style="font-size: 16px; line-height: 1.6; color: #374151;">Hi {{customerName}},</p>
          <p style="font-size: 16px; line-height: 1.6; color: #374151;">Thank you for your order! We're preparing your items for shipment.</p>
          
          <div style="background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #92400E; margin-top: 0;">Order Details</h3>
            <p><strong>Order Number:</strong> #{{orderNumber}}</p>
            <p><strong>Order Date:</strong> {{orderDate}}</p>
            <p><strong>Total Amount:</strong> {{orderTotal}}</p>
          </div>
          
          <div style="background: #F9FAFB; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #374151; margin-top: 0;">Shipping Information</h3>
            <p>{{shippingAddress}}</p>
            <p><strong>Estimated Delivery:</strong> {{estimatedDelivery}}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{trackingUrl}}" style="background: #F59E0B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">Track Your Order</a>
          </div>
        </main>
      </div>
    `,
    plainTextContent: `Order Confirmed!

Hi {{customerName}},

Thank you for your order! We're preparing your items for shipment.

Order Details:
Order Number: #{{orderNumber}}
Order Date: {{orderDate}}
Total Amount: {{orderTotal}}

Shipping Information:
{{shippingAddress}}
Estimated Delivery: {{estimatedDelivery}}

Track your order: {{trackingUrl}}`,
    variables: ['customerName', 'orderNumber', 'orderDate', 'orderTotal', 'shippingAddress', 'estimatedDelivery', 'trackingUrl'],
    status: 'approved',
    enabled: true,
    version: 1,
    createdBy: 'user_1',
    createdAt: new Date('2024-01-25T14:00:00Z'),
    lastModifiedBy: 'user_1',
    lastModifiedAt: new Date('2024-01-25T14:00:00Z'),
    approvedBy: 'user_2',
    approvedAt: new Date('2024-01-25T14:30:00Z'),
    tags: ['transactional', 'order', 'confirmation']
  },
  {
    id: 'template_5',
    domain: 'marketing',
    folderId: 'folder_1',
    name: 'Password Reset Request',
    subject: 'Reset your {{companyName}} password',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <header style="background: #374151; padding: 40px 20px; text-align: center;">
          <h1 style="color: white; font-size: 28px; margin: 0;">Password Reset</h1>
        </header>
        <main style="padding: 30px 20px;">
          <p style="font-size: 16px; line-height: 1.6; color: #374151;">Hi {{userName}},</p>
          <p style="font-size: 16px; line-height: 1.6; color: #374151;">We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>
          
          <div style="background: #FEF2F2; border: 1px solid #FECACA; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p style="color: #B91C1C; margin: 0;"><strong>Security Notice:</strong> This link will expire in 1 hour for your security.</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{resetUrl}}" style="background: #374151; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">Reset Password</a>
          </div>
          
          <p style="font-size: 14px; color: #6B7280;">If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="font-size: 14px; color: #6B7280; word-break: break-all;">{{resetUrl}}</p>
        </main>
      </div>
    `,
    plainTextContent: `Password Reset

Hi {{userName}},

We received a request to reset your password. If you didn't make this request, you can safely ignore this email.

Security Notice: This link will expire in 1 hour for your security.

Reset your password: {{resetUrl}}

If the link doesn't work, copy and paste it into your browser.`,
    variables: ['companyName', 'userName', 'resetUrl'],
    status: 'approved',
    enabled: true,
    version: 1,
    createdBy: 'user_1',
    createdAt: new Date('2024-01-18T16:00:00Z'),
    lastModifiedBy: 'user_1',
    lastModifiedAt: new Date('2024-01-18T16:00:00Z'),
    approvedBy: 'user_2',
    approvedAt: new Date('2024-01-18T16:15:00Z'),
    tags: ['transactional', 'security', 'password']
  },
  {
    id: 'template_6',
    domain: 'marketing',
    name: 'Event Invitation Template',
    subject: 'You\'re invited to {{eventName}} - {{eventDate}}',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <header style="background: linear-gradient(135deg, #8B5CF6, #A855F7); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; font-size: 28px; margin: 0;">You're Invited!</h1>
        </header>
        <main style="padding: 30px 20px;">
          <div style="text-align: center; margin: 20px 0;">
            <h2 style="color: #1F2937; font-size: 24px; margin: 10px 0;">{{eventName}}</h2>
            <p style="font-size: 18px; color: #8B5CF6; font-weight: 600;">{{eventDate}} at {{eventTime}}</p>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6; color: #374151;">{{eventDescription}}</p>
          
          <div style="background: #F5F3FF; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #7C3AED; margin-top: 0;">Event Details</h3>
            <p><strong>Location:</strong> {{eventLocation}}</p>
            <p><strong>Dress Code:</strong> {{dressCode}}</p>
            <p><strong>RSVP Deadline:</strong> {{rsvpDeadline}}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{rsvpUrl}}" style="background: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-right: 10px;">RSVP Now</a>
            <a href="{{calendarUrl}}" style="background: transparent; color: #8B5CF6; padding: 12px 24px; text-decoration: none; border: 2px solid #8B5CF6; border-radius: 6px; font-weight: 600;">Add to Calendar</a>
          </div>
        </main>
      </div>
    `,
    plainTextContent: `You're Invited!

{{eventName}}
{{eventDate}} at {{eventTime}}

{{eventDescription}}

Event Details:
Location: {{eventLocation}}
Dress Code: {{dressCode}}
RSVP Deadline: {{rsvpDeadline}}

RSVP: {{rsvpUrl}}
Add to Calendar: {{calendarUrl}}`,
    variables: ['eventName', 'eventDate', 'eventTime', 'eventDescription', 'eventLocation', 'dressCode', 'rsvpDeadline', 'rsvpUrl', 'calendarUrl'],
    status: 'archived',
    enabled: false,
    version: 1,
    createdBy: 'user_1',
    createdAt: new Date('2023-12-15T10:00:00Z'),
    lastModifiedBy: 'user_1',
    lastModifiedAt: new Date('2023-12-15T10:00:00Z'),
    tags: ['event', 'invitation', 'marketing']
  }
];

export const mockApprovalRequests: ApprovalRequest[] = [
  {
    id: 'approval_1',
    templateId: 'template_2',
    templateVersion: 1,
    requestedBy: 'user_1',
    requestedAt: new Date('2024-02-01T09:30:00Z'),
    approvers: ['user_2', 'user_3'],
    status: 'pending',
    changes: 'Updated feature benefits and call-to-action button'
  },
  {
    id: 'approval_2',
    templateId: 'template_1',
    templateVersion: 2,
    requestedBy: 'user_1',
    requestedAt: new Date('2024-01-20T14:30:00Z'),
    approvers: ['user_2'],
    status: 'approved',
    approvedBy: 'user_2',
    approvedAt: new Date('2024-01-20T15:00:00Z'),
    comments: 'Looks good! The updated welcome flow is much clearer.',
    changes: 'Revised welcome message and added dashboard link'
  }
];