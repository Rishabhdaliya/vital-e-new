import React, { useState } from 'react';
import { Button } from '../ui/button';
import { EnvelopeClosedIcon } from '@radix-ui/react-icons';
import { useSelector } from 'react-redux';
import { Task } from './data/schema';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { ClipboardCopyIcon, Cross1Icon } from '@radix-ui/react-icons';
import { useToast } from '@/hooks/use-toast';
import EmailTemplate from '@/lib/emailTemplate';

const MailFormatter = () => {
  //   const [dialogContentType, setDialogContentType] = useState<string | null>(
  //     null
  //   );
  const [toEmails, setToEmails] = useState<string>('');
  const [ccEmails, setCcEmails] = useState<string>('');
  const selectedIssues = useSelector(
    (state: { issues: { selectedIssues: Task[] } }) =>
      state.issues.selectedIssues
  );
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { toast } = useToast();

  const isUniqueValue = (array: string[], value: string) => {
    return !array.includes(value);
  };

  const handleMailFormatter = (type: string) => {
    if (selectedIssues.length === 0) {
      return toast({
        variant: 'destructive',
        title: 'Error',
        description:
          'No issues Selected select atleast one issue to make mail formatter',
      });
    }

    const assignees = Array.from(
      new Set(
        selectedIssues
          .map(
            (issue) => (issue.assignee as unknown as { email: string }).email
          )
          .filter((email) => email != null)
      )
    );

    const directorEmails: string[] = [];
    const supervisorEmails: string[] = [];

    selectedIssues.forEach((issue) => {
      const defectStatus: {
        director?: { email?: string };
        supervisor?: { email?: string };
      } =
        typeof issue.defectStatus === 'object' && issue.defectStatus !== null
          ? issue.defectStatus
          : {};

      if (
        defectStatus.director?.email &&
        isUniqueValue(directorEmails, defectStatus.director.email)
      ) {
        directorEmails.push(defectStatus.director.email);
      }

      if (
        defectStatus.supervisor?.email &&
        isUniqueValue(supervisorEmails, defectStatus.supervisor.email)
      ) {
        supervisorEmails.push(defectStatus.supervisor.email);
      }
    });

    if (type === 'assignee') {
      setToEmails(assignees.join(', '));
      setCcEmails('');
    } else if (type === 'supervisor') {
      setToEmails(supervisorEmails.join(', '));
      setCcEmails(assignees.join(', '));
    } else if (type === 'director') {
      setToEmails(directorEmails.join(', '));
      setCcEmails([...assignees, ...supervisorEmails].join(', '));
    }
    // setDialogContentType(type);
    setIsOpen(true);
  };

  // Function to close the dialog
  const closeDialog = () => {
    setIsOpen(false);
  };

  return (
    <>
      <Button onClick={() => handleMailFormatter('assignee')}>
        <EnvelopeClosedIcon />
        Assignee
      </Button>
      <Button onClick={() => handleMailFormatter('supervisor')}>
        <EnvelopeClosedIcon />
        Supervisor
      </Button>
      <Button onClick={() => handleMailFormatter('director')}>
        <EnvelopeClosedIcon />
        Director
      </Button>
      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent className="w-full  max-w-screen-lg h-auto max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Compose Email</DialogTitle>
            <Button
              onClick={closeDialog} // Close dialog when clicking the close button
              className="absolute top-2 right-2 p-2 z-10 hover:scale-105 "
            >
              <Cross1Icon />
            </Button>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700">
                To:
              </label>
              <div className="flex items-center">
                <Input
                  value={toEmails}
                  onChange={(e) => setToEmails(e.target.value)}
                  className="flex-grow"
                />
                <CopyToClipboard text={toEmails}>
                  <Button className="ml-2 bg-white border border-gray-300 hover:bg-gray-100 px-2 ">
                    <ClipboardCopyIcon className="text-gray-800 " />
                  </Button>
                </CopyToClipboard>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700">
                CC:
              </label>
              <div className="flex items-center">
                <Input
                  value={ccEmails}
                  onChange={(e) => setCcEmails(e.target.value)}
                  className="flex-grow"
                />
                <CopyToClipboard text={ccEmails}>
                  <Button className="ml-2 bg-white border border-gray-300 hover:bg-gray-100 px-2 ">
                    <ClipboardCopyIcon className="text-gray-800 " />
                  </Button>
                </CopyToClipboard>
              </div>
            </div>

            {/* Mail Body field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700">
                Mail Body:
              </label>
              <div className="flex items-center">
                {selectedIssues && <EmailTemplate data={selectedIssues} />}
                {/* <CopyToClipboard text={body}>
                  <Button className="ml-2 bg-white border border-gray-300 hover:bg-gray-100 px-2 ">
                    <ClipboardCopyIcon className="text-gray-800 " />
                  </Button>
                </CopyToClipboard> */}
              </div>
            </div>

            {/* Send Email button */}
            {/* <Button onClick={handleSendMail} className="mt-4">
              Send Email
            </Button> */}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MailFormatter;
