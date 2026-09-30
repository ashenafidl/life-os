"use client";

import { PlusIcon, UserCircleIcon, XIcon } from "@phosphor-icons/react";
import { useMemo, useState, useTransition } from "react";

import {
  createPerson,
  linkPersonToTransaction,
  unlinkPersonFromTransaction,
} from "@/actions/finance";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  counterpartyName,
  rankPeopleMatches,
  type PersonWithAliases,
} from "@/lib/name-matching";

interface Props {
  transactionId: string;
  transaction: {
    type: "income" | "expense" | null;
    senderName: string | null;
    recipientName: string | null;
  };
  person: { id: string; name: string } | null;
  personSource: "auto" | "manual" | null;
  people: PersonWithAliases[];
}

/** Suggestion score below which a candidate isn't worth surfacing. */
const SUGGESTION_FLOOR = 0.5;

export default function PersonMatchField({
  transactionId,
  transaction,
  person,
  personSource,
  people,
}: Props) {
  const [selectedPerson, setSelectedPerson] = useState(person);
  const [source, setSource] = useState(personSource);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [_, startTransition] = useTransition();

  const capturedName = counterpartyName(transaction);

  const suggestions = useMemo(() => {
    if (!capturedName) return [];
    const byId = new Map(people.map((candidate) => [candidate.id, candidate]));
    return rankPeopleMatches(capturedName, people)
      .filter((candidate) => candidate.score >= SUGGESTION_FLOOR)
      .slice(0, 4)
      .map((candidate) => ({
        person: byId.get(candidate.personId)!,
        score: candidate.score,
      }));
  }, [capturedName, people]);

  const suggestedIds = new Set(suggestions.map((item) => item.person.id));
  const normalizedQuery = query.trim().toLowerCase();
  const others = people.filter(
    (candidate) =>
      candidate.id !== selectedPerson?.id &&
      !suggestedIds.has(candidate.id) &&
      (!normalizedQuery ||
        candidate.name.toLowerCase().includes(normalizedQuery)),
  );

  const hasExactName =
    capturedName !== null &&
    people.some(
      (candidate) =>
        candidate.name.toLowerCase() === capturedName.toLowerCase() ||
        candidate.aliases.some(
          (alias) => alias.toLowerCase() === capturedName.toLowerCase(),
        ),
    );

  const handleLink = (target: PersonWithAliases) => {
    setOpen(false);
    setQuery("");
    setSelectedPerson({ id: target.id, name: target.name });
    setSource("manual");

    startTransition(async () => {
      await linkPersonToTransaction(transactionId, target.id);
    });
  };

  const handleCreateAndLink = () => {
    if (!capturedName) return;

    setOpen(false);
    setQuery("");

    startTransition(async () => {
      const { person: created } = await createPerson(capturedName);
      if (!created) return;

      setSelectedPerson({ id: created.id, name: created.name });
      setSource("manual");
      await linkPersonToTransaction(transactionId, created.id);
    });
  };

  const handleUnlink = () => {
    setSelectedPerson(null);
    setSource(null);

    startTransition(async () => {
      await unlinkPersonFromTransaction(transactionId);
    });
  };

  return (
    <div className="mt-4">
      <p className="text-muted-foreground mb-2 text-xs tracking-wide uppercase">
        Person
      </p>

      <div className="flex flex-wrap items-center gap-2">
        {selectedPerson ? (
          <Badge variant="outline" className="rounded-full py-3 pr-0! pl-2">
            <UserCircleIcon />
            <span>{selectedPerson.name}</span>
            {source && (
              <span className="text-muted-foreground text-[10px] tracking-wide uppercase">
                {source}
              </span>
            )}
            <Button
              variant="ghost"
              aria-label={`Unlink ${selectedPerson.name}`}
              className="flex size-6 items-center justify-center rounded-full bg-black/10 transition-colors hover:bg-black/20"
              onClick={handleUnlink}
            >
              <XIcon className="size-2.5" />
            </Button>
          </Badge>
        ) : (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
              render={
                <Button variant="outline" size="xs">
                  <PlusIcon />
                  Link person
                </Button>
              }
            />
            <PopoverContent align="start" className="w-64 gap-2 p-2">
              {capturedName && (
                <p className="text-muted-foreground px-1 text-xs">
                  Captured:{" "}
                  <span className="text-foreground font-medium">
                    {capturedName}
                  </span>
                </p>
              )}

              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search people"
                className="h-8"
              />

              <div className="flex max-h-56 flex-col overflow-y-auto">
                {suggestions.length > 0 && (
                  <p className="text-muted-foreground px-2 py-1 text-[10px] tracking-wide uppercase">
                    Suggested
                  </p>
                )}

                {suggestions.map(({ person: candidate, score }) => (
                  <button
                    key={candidate.id}
                    type="button"
                    onClick={() => handleLink(candidate)}
                    className="hover:bg-muted flex items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-left text-sm"
                  >
                    <span>{candidate.name}</span>
                    <span className="text-muted-foreground text-xs">
                      {Math.round(score * 100)}%
                    </span>
                  </button>
                ))}

                {others.length > 0 && (
                  <p className="text-muted-foreground px-2 py-1 text-[10px] tracking-wide uppercase">
                    All people
                  </p>
                )}

                {others.map((candidate) => (
                  <button
                    key={candidate.id}
                    type="button"
                    onClick={() => handleLink(candidate)}
                    className="hover:bg-muted rounded-sm px-2 py-1.5 text-left text-sm"
                  >
                    {candidate.name}
                  </button>
                ))}

                {suggestions.length === 0 &&
                  others.length === 0 &&
                  !capturedName && (
                    <p className="text-muted-foreground px-2 py-1.5 text-sm">
                      No people yet.
                    </p>
                  )}
              </div>

              {capturedName && !hasExactName && (
                <>
                  <div className="bg-border h-px" />
                  <button
                    type="button"
                    onClick={handleCreateAndLink}
                    className="hover:bg-muted flex items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm"
                  >
                    <PlusIcon className="size-3" />
                    Create &ldquo;{capturedName}&rdquo;
                  </button>
                </>
              )}
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  );
}
