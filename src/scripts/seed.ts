import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Company } from '../entities/company.entity';
import { Contact } from '../entities/contact.entity';
import { Deal } from '../entities/deal.entity';
import { ContactGroup } from '../entities/contact-group.entity';
import { EmailThread } from '../entities/email-thread.entity';
import { EmailMessage } from '../entities/email-message.entity';
import { RAGService } from '../services/rag.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

async function seed() {
  console.log('🌱 Starting database seeding...');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const companyRepo = app.get<Repository<Company>>(getRepositoryToken(Company));
  const contactRepo = app.get<Repository<Contact>>(getRepositoryToken(Contact));
  const dealRepo = app.get<Repository<Deal>>(getRepositoryToken(Deal));
  const groupRepo = app.get<Repository<ContactGroup>>(getRepositoryToken(ContactGroup));
  const threadRepo = app.get<Repository<EmailThread>>(getRepositoryToken(EmailThread));
  const messageRepo = app.get<Repository<EmailMessage>>(getRepositoryToken(EmailMessage));
  const ragService = app.get(RAGService);

  try {
    // Create companies
    console.log('Creating companies...');
    const companies = await companyRepo.save([
      {
        name: 'TechCorp Solutions',
        website: 'https://techcorp.com',
        industry: 'Software',
        size: '100-500',
        description: 'Leading provider of enterprise software solutions for mid-market companies.',
        address: '123 Tech Street',
        city: 'San Francisco',
        state: 'CA',
        country: 'USA',
        zipCode: '94105',
        phone: '+1-555-0101',
        annualRevenue: 50000000,
        status: 'active'
      },
      {
        name: 'Global Manufacturing Inc',
        website: 'https://globalmfg.com',
        industry: 'Manufacturing',
        size: '1000+',
        description: 'International manufacturing company specializing in automotive parts.',
        address: '456 Industrial Blvd',
        city: 'Detroit',
        state: 'MI',
        country: 'USA',
        zipCode: '48201',
        phone: '+1-555-0102',
        annualRevenue: 150000000,
        status: 'active'
      },
      {
        name: 'StartupXYZ',
        website: 'https://startupxyz.com',
        industry: 'FinTech',
        size: '10-50',
        description: 'Innovative fintech startup focused on digital payment solutions.',
        address: '789 Startup Ave',
        city: 'Austin',
        state: 'TX',
        country: 'USA',
        zipCode: '78701',
        phone: '+1-555-0103',
        annualRevenue: 5000000,
        status: 'active'
      },
      {
        name: 'Healthcare Partners',
        website: 'https://healthpartners.com',
        industry: 'Healthcare',
        size: '500-1000',
        description: 'Regional healthcare provider with multiple clinic locations.',
        address: '321 Medical Center Dr',
        city: 'Chicago',
        state: 'IL',
        country: 'USA',
        zipCode: '60601',
        phone: '+1-555-0104',
        annualRevenue: 75000000,
        status: 'active'
      }
    ]);

    // Create contacts
    console.log('Creating contacts...');
    const contacts = await contactRepo.save([
      // TechCorp Solutions contacts
      {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@techcorp.com',
        phone: '+1-555-1001',
        position: 'CTO',
        department: 'Technology',
        notes: 'Key decision maker for technology purchases. Prefers technical details.',
        company: companies[0],
        status: 'active'
      },
      {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@techcorp.com',
        phone: '+1-555-1002',
        position: 'VP of Sales',
        department: 'Sales',
        notes: 'Interested in solutions that can improve sales team productivity.',
        company: companies[0],
        status: 'active'
      },
      // Global Manufacturing contacts
      {
        firstName: 'Michael',
        lastName: 'Brown',
        email: 'michael.brown@globalmfg.com',
        phone: '+1-555-2001',
        position: 'Operations Director',
        department: 'Operations',
        notes: 'Focused on operational efficiency and cost reduction.',
        company: companies[1],
        status: 'active'
      },
      {
        firstName: 'Lisa',
        lastName: 'Davis',
        email: 'lisa.davis@globalmfg.com',
        phone: '+1-555-2002',
        position: 'Procurement Manager',
        department: 'Procurement',
        notes: 'Handles vendor relationships and contract negotiations.',
        company: companies[1],
        status: 'active'
      },
      // StartupXYZ contacts
      {
        firstName: 'David',
        lastName: 'Wilson',
        email: 'david.wilson@startupxyz.com',
        phone: '+1-555-3001',
        position: 'Founder & CEO',
        department: 'Executive',
        notes: 'Young entrepreneur, very responsive to innovative solutions.',
        company: companies[2],
        status: 'active'
      },
      {
        firstName: 'Emily',
        lastName: 'Taylor',
        email: 'emily.taylor@startupxyz.com',
        phone: '+1-555-3002',
        position: 'Head of Product',
        department: 'Product',
        notes: 'Product-focused, interested in user experience improvements.',
        company: companies[2],
        status: 'active'
      },
      // Healthcare Partners contacts
      {
        firstName: 'Robert',
        lastName: 'Miller',
        email: 'robert.miller@healthpartners.com',
        phone: '+1-555-4001',
        position: 'Chief Medical Officer',
        department: 'Medical',
        notes: 'Focuses on patient care quality and clinical outcomes.',
        company: companies[3],
        status: 'active'
      },
      {
        firstName: 'Jennifer',
        lastName: 'Anderson',
        email: 'jennifer.anderson@healthpartners.com',
        phone: '+1-555-4002',
        position: 'IT Director',
        department: 'IT',
        notes: 'Responsible for healthcare IT systems and compliance.',
        company: companies[3],
        status: 'active'
      }
    ]);

    // Create contact groups
    console.log('Creating contact groups...');
    const groups = await groupRepo.save([
      {
        name: 'Enterprise Prospects',
        description: 'Large enterprise companies with 500+ employees',
        status: 'active',
        contacts: [contacts[2], contacts[3], contacts[6], contacts[7]] // Global Manufacturing and Healthcare
      },
      {
        name: 'Tech Leaders',
        description: 'Technology decision makers and CTOs',
        status: 'active',
        contacts: [contacts[0], contacts[4], contacts[7]] // CTOs and tech leaders
      },
      {
        name: 'Startup Founders',
        description: 'Startup founders and early-stage companies',
        status: 'active',
        contacts: [contacts[4], contacts[5]] // StartupXYZ team
      }
    ]);

    // Create deals
    console.log('Creating deals...');
    const deals = await dealRepo.save([
      {
        title: 'TechCorp CRM Implementation',
        description: 'Full CRM implementation for TechCorp Solutions including data migration and training.',
        value: 125000,
        stage: 'proposal',
        probability: 75,
        expectedCloseDate: new Date('2024-12-31'),
        notes: 'Strong interest shown, waiting for final budget approval.',
        company: companies[0],
        primaryContact: contacts[0]
      },
      {
        title: 'Global Manufacturing ERP Integration',
        description: 'Integration between existing ERP system and new CRM platform.',
        value: 200000,
        stage: 'negotiation',
        probability: 60,
        expectedCloseDate: new Date('2025-01-15'),
        notes: 'Price negotiations ongoing, technical requirements approved.',
        company: companies[1],
        primaryContact: contacts[2]
      },
      {
        title: 'StartupXYZ Growth Package',
        description: 'Startup-friendly CRM package with payment processing integration.',
        value: 25000,
        stage: 'qualified',
        probability: 85,
        expectedCloseDate: new Date('2024-11-30'),
        notes: 'Perfect fit for their needs, very enthusiastic about the solution.',
        company: companies[2],
        primaryContact: contacts[4]
      },
      {
        title: 'Healthcare Partners Compliance Suite',
        description: 'HIPAA-compliant CRM solution for healthcare industry.',
        value: 175000,
        stage: 'open',
        probability: 25,
        expectedCloseDate: new Date('2025-02-28'),
        notes: 'Initial discussions, need to address compliance requirements.',
        company: companies[3],
        primaryContact: contacts[6]
      }
    ]);

    // Create email threads and messages
    console.log('Creating email threads...');
    const threads = await threadRepo.save([
      {
        subject: 'CRM Implementation Discussion',
        participants: ['john.smith@techcorp.com', 'sales@softsync.com'],
        contactId: contacts[0].id,
        companyId: companies[0].id,
        status: 'active'
      },
      {
        subject: 'Follow-up on Product Demo',
        participants: ['david.wilson@startupxyz.com', 'sales@softsync.com'],
        contactId: contacts[4].id,
        companyId: companies[2].id,
        status: 'active'
      }
    ]);

    await messageRepo.save([
      // Thread 1 messages
      {
        from: 'sales@softsync.com',
        to: ['john.smith@techcorp.com'],
        subject: 'CRM Implementation Discussion',
        body: 'Hi John,\n\nThank you for your interest in our CRM solution. Based on our initial conversation, I believe our enterprise package would be perfect for TechCorp Solutions.\n\nWould you be available for a detailed demo next week?\n\nBest regards,\nSales Team',
        isHtml: false,
        direction: 'outbound',
        status: 'sent',
        thread: threads[0]
      },
      {
        from: 'john.smith@techcorp.com',
        to: ['sales@softsync.com'],
        subject: 'Re: CRM Implementation Discussion',
        body: 'Hi,\n\nYes, I\'m definitely interested in seeing a demo. We\'re particularly concerned about data migration from our current system and integration with our existing tools.\n\nCould we schedule something for Tuesday or Wednesday next week?\n\nThanks,\nJohn',
        isHtml: false,
        direction: 'inbound',
        status: 'delivered',
        thread: threads[0]
      },
      // Thread 2 messages
      {
        from: 'sales@softsync.com',
        to: ['david.wilson@startupxyz.com'],
        subject: 'Follow-up on Product Demo',
        body: 'Hi David,\n\nI hope you enjoyed our product demo yesterday. The startup package seems like a great fit for your current needs and growth plans.\n\nDo you have any questions about the pricing or features we discussed?\n\nBest regards,\nSales Team',
        isHtml: false,
        direction: 'outbound',
        status: 'sent',
        thread: threads[1]
      },
      {
        from: 'david.wilson@startupxyz.com',
        to: ['sales@softsync.com'],
        subject: 'Re: Follow-up on Product Demo',
        body: 'Hi,\n\nThe demo was great! I\'m really impressed with the automation features. My main concern is the implementation timeline - we need to be up and running within 4 weeks due to our upcoming product launch.\n\nIs that feasible?\n\nThanks,\nDavid',
        isHtml: false,
        direction: 'inbound',
        status: 'delivered',
        thread: threads[1]
      }
    ]);

    // Index documents for RAG
    console.log('Indexing documents for RAG...');
    
    // Index company information
    for (const company of companies) {
      await ragService.indexDocument(
        `Company: ${company.name}`,
        `${company.name} is a ${company.industry} company with ${company.size} employees. 
        ${company.description} They are located in ${company.city}, ${company.state}. 
        Annual revenue: $${company.annualRevenue?.toLocaleString() || 'Unknown'}. 
        Website: ${company.website || 'Not provided'}.`,
        'company',
        company.id,
        { industry: company.industry, size: company.size, location: `${company.city}, ${company.state}` }
      );
    }

    // Index contact information
    for (const contact of contacts) {
      const fullName = `${contact.firstName} ${contact.lastName}`;
      await ragService.indexDocument(
        `Contact: ${fullName}`,
        `${fullName} is the ${contact.position || 'Unknown position'} at ${contact.company?.name || 'Unknown company'}. 
        Email: ${contact.email}. Department: ${contact.department || 'Unknown'}. 
        Notes: ${contact.notes || 'No additional notes'}. 
        Phone: ${contact.phone || 'Not provided'}.`,
        'contact',
        contact.id,
        { 
          position: contact.position, 
          department: contact.department, 
          company: contact.company?.name,
          email: contact.email,
          fullName: fullName
        }
      );
    }

    // Index deal information
    for (const deal of deals) {
      const primaryContactName = deal.primaryContact ? `${deal.primaryContact.firstName} ${deal.primaryContact.lastName}` : 'Unknown';
      await ragService.indexDocument(
        `Deal: ${deal.title}`,
        `${deal.title} is a ${deal.stage} deal worth $${deal.value.toLocaleString()} with ${deal.company?.name || 'Unknown company'}. 
        Description: ${deal.description}. 
        Probability: ${deal.probability}%. 
        Expected close date: ${deal.expectedCloseDate?.toDateString() || 'Not set'}. 
        Primary contact: ${primaryContactName}. 
        Notes: ${deal.notes || 'No additional notes'}.`,
        'deal',
        deal.id,
        { 
          stage: deal.stage, 
          value: deal.value, 
          probability: deal.probability,
          company: deal.company?.name,
          primaryContact: primaryContactName
        }
      );
    }

    // Index email threads
    for (const thread of threads) {
      const messages = await messageRepo.find({ where: { threadId: thread.id } });
      const messageContent = messages
        .map(msg => `From: ${msg.from}, To: ${msg.to.join(', ')}, Subject: ${msg.subject}, Body: ${msg.body}`)
        .join('\n\n');
      
      await ragService.indexDocument(
        `Email Thread: ${thread.subject}`,
        `Email conversation about "${thread.subject}" with participants: ${thread.participants.join(', ')}. 
        Messages: ${messageContent}`,
        'email',
        thread.id,
        { 
          subject: thread.subject, 
          participants: thread.participants,
          messageCount: messages.length
        }
      );
    }

    // Add some general knowledge documents
    await ragService.indexDocument(
      'SoftSync CRM Features',
      `SoftSync CRM offers comprehensive customer relationship management features including:
      - Contact and company management
      - Deal pipeline tracking
      - Email integration and automation
      - AI-powered insights and recommendations
      - Customizable dashboards and reporting
      - Mobile app for on-the-go access
      - Integration with popular business tools
      - Advanced security and compliance features`,
      'knowledge',
      'features',
      { category: 'product', type: 'features' }
    );

    await ragService.indexDocument(
      'Implementation Process',
      `Our typical CRM implementation process includes:
      1. Discovery and requirements gathering (1-2 weeks)
      2. Data migration and system setup (2-3 weeks)
      3. User training and onboarding (1 week)
      4. Go-live and support (ongoing)
      
      For enterprise clients, we provide dedicated project managers and technical consultants.
      Startup packages can be implemented in as little as 2 weeks with our quick-start program.`,
      'knowledge',
      'implementation',
      { category: 'process', type: 'implementation' }
    );

    console.log('✅ Database seeding completed successfully!');
    console.log(`Created:
    - ${companies.length} companies
    - ${contacts.length} contacts
    - ${deals.length} deals
    - ${groups.length} contact groups
    - ${threads.length} email threads
    - Multiple indexed documents for RAG`);
    
    console.log('\n📋 Reference IDs for testing:');
    console.log('Contact Groups:');
    groups.forEach(group => {
      console.log(`  - ${group.name}: ${group.id}`);
    });
    console.log('Email Threads:');
    threads.forEach(thread => {
      console.log(`  - ${thread.subject}: ${thread.id}`);
    });

  } catch (error) {
    console.error('❌ Error during seeding:', error);
  } finally {
    await app.close();
  }
}

// Run the seed function
seed().catch(console.error);
