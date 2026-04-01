/*eslint-disable max-lines*/
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CommunityVisibility,
  useCommunityDetailQuery,
  useCommunityOverviewQuery,
  useCopyCommunitySharedBankToMyBankActionMutation,
  useCreateCommunityActionMutation,
  useJoinCommunityActionMutation,
  useShareQuestionBankToCommunityActionMutation,
} from "@/graphql/generated";
import { TEACHER_COMMON_TEXT } from "../teacher-ui";

const formatGradeLabel = (grade: number) =>
  grade > 0 ? `${grade}-р анги` : "Бүх анги";

const formatVisibilityLabel = (visibility: CommunityVisibility) =>
  visibility === CommunityVisibility.Public ? "Нээлттэй" : "Хаалттай";

export function CommunitySection() {
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [grade, setGrade] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<CommunityVisibility>(
    CommunityVisibility.Public,
  );
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const overviewQuery = useCommunityOverviewQuery({
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });
  const [createCommunity, createCommunityState] = useCreateCommunityActionMutation();
  const [joinCommunity, joinCommunityState] = useJoinCommunityActionMutation();
  const [shareQuestionBank, shareQuestionBankState] =
    useShareQuestionBankToCommunityActionMutation();
  const [copySharedBank, copySharedBankState] =
    useCopyCommunitySharedBankToMyBankActionMutation();

  const communities = overviewQuery.data?.communities ?? [];
  const viewerId = overviewQuery.data?.me?.id ?? null;

  useEffect(() => {
    if (!communities.length) {
      setSelectedCommunityId(null);
      return;
    }

    if (
      !selectedCommunityId ||
      !communities.some((community) => community.id === selectedCommunityId)
    ) {
      setSelectedCommunityId(communities[0]?.id ?? null);
    }
  }, [communities, selectedCommunityId]);

  const detailQuery = useCommunityDetailQuery({
    variables: { id: selectedCommunityId ?? "" },
    skip: !selectedCommunityId,
    fetchPolicy: "cache-and-network",
  });

  const selectedCommunity = detailQuery.data?.community ?? null;

  const myBanks = useMemo(
    () =>
      (overviewQuery.data?.questionBanks ?? []).filter(
        (bank) => bank.owner.id === viewerId,
      ),
    [overviewQuery.data?.questionBanks, viewerId],
  );

  const sharedBankIds = useMemo(
    () => new Set(selectedCommunity?.sharedBanks.map((item) => item.bank.id) ?? []),
    [selectedCommunity?.sharedBanks],
  );

  const shareableBanks = useMemo(
    () => myBanks.filter((bank) => !sharedBankIds.has(bank.id)),
    [myBanks, sharedBankIds],
  );

  const isMutating =
    createCommunityState.loading ||
    joinCommunityState.loading ||
    shareQuestionBankState.loading ||
    copySharedBankState.loading;

  const refreshAll = async () => {
    await overviewQuery.refetch();
    if (selectedCommunityId) {
      await detailQuery.refetch({ id: selectedCommunityId });
    }
  };

  const handleCreateCommunity = async () => {
    try {
      setErrorMessage(null);
      setFeedbackMessage(null);
      const result = await createCommunity({
        variables: {
          name: name.trim(),
          description: description.trim() || null,
          subject: subject.trim() || "Ерөнхий",
          grade: Number.parseInt(grade.trim(), 10) || 0,
          visibility,
        },
      });
      const community = result.data?.createCommunity;
      if (!community) {
        throw new Error("Community үүсгэсэн хариу ирсэнгүй.");
      }
      setSelectedCommunityId(community.id);
      setName("");
      setSubject("");
      setGrade("");
      setDescription("");
      setVisibility(CommunityVisibility.Public);
      setFeedbackMessage("Community амжилттай үүслээ.");
      await refreshAll();
    } catch (error) {
      console.error("Failed to create community", error);
      setErrorMessage("Community үүсгэх үед алдаа гарлаа.");
    }
  };

  const handleJoinCommunity = async (communityId: string) => {
    try {
      setErrorMessage(null);
      setFeedbackMessage(null);
      await joinCommunity({ variables: { communityId } });
      setSelectedCommunityId(communityId);
      setFeedbackMessage("Community-д амжилттай нэгдлээ.");
      await refreshAll();
    } catch (error) {
      console.error("Failed to join community", error);
      setErrorMessage("Community-д нэгдэх үед алдаа гарлаа.");
    }
  };

  const handleShareBank = async (bankId: string) => {
    if (!selectedCommunityId) {
      return;
    }

    try {
      setErrorMessage(null);
      setFeedbackMessage(null);
      await shareQuestionBank({
        variables: {
          communityId: selectedCommunityId,
          bankId,
        },
      });
      setFeedbackMessage("My Bank community feed рүү амжилттай орлоо.");
      await refreshAll();
    } catch (error) {
      console.error("Failed to share bank", error);
      setErrorMessage("Question bank share хийх үед алдаа гарлаа.");
    }
  };

  const handleCopySharedBank = async (sharedBankId: string) => {
    try {
      setErrorMessage(null);
      setFeedbackMessage(null);
      await copySharedBank({ variables: { sharedBankId } });
      setFeedbackMessage("Shared bank-ийг таны My Bank руу copy хийлээ.");
      await overviewQuery.refetch();
    } catch (error) {
      console.error("Failed to copy shared bank", error);
      setErrorMessage("Shared bank copy хийх үед алдаа гарлаа.");
    }
  };

  return (
    <section className="mx-auto w-full max-w-[1120px] space-y-6">
      <div>
        <h1 className="text-[24px] font-semibold text-[#0F1216]">
          {TEACHER_COMMON_TEXT.community}
        </h1>
        <p className="mt-1 text-[14px] text-[#52555B]">
          My Bank-аа community руу share хийгээд, бусдын сайн сангуудыг өөрийн bank руу copy хийж ашиглана.
        </p>
      </div>

      {feedbackMessage ? (
        <div className="rounded-2xl border border-[#CDEAD7] bg-[#F3FBF6] px-5 py-4 text-[14px] text-[#0F7A4F]">
          {feedbackMessage}
        </div>
      ) : null}
      {errorMessage ? (
        <div className="rounded-2xl border border-[#F1D6D5] bg-[#FFF5F4] px-5 py-4 text-[14px] text-[#B42318]">
          {errorMessage}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#DFE1E5] bg-white p-5 shadow-[0px_4px_8px_-2px_rgba(0,0,0,0.08)]">
            <h2 className="text-[18px] font-semibold text-[#0F1216]">Шинэ community</h2>
            <div className="mt-4 space-y-3">
              <input
                className="w-full rounded-xl border border-[#D0D5DD] px-4 py-3 text-[14px] outline-none"
                placeholder="Жишээ: 10-р ангийн математикийн багш нар"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <input
                  className="w-full rounded-xl border border-[#D0D5DD] px-4 py-3 text-[14px] outline-none"
                  placeholder="Хичээл"
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                />
                <input
                  className="w-full rounded-xl border border-[#D0D5DD] px-4 py-3 text-[14px] outline-none"
                  placeholder="Анги"
                  value={grade}
                  inputMode="numeric"
                  onChange={(event) => setGrade(event.target.value)}
                />
              </div>
              <select
                className="w-full rounded-xl border border-[#D0D5DD] px-4 py-3 text-[14px] outline-none"
                value={visibility}
                onChange={(event) =>
                  setVisibility(event.target.value as CommunityVisibility)
                }
              >
                <option value={CommunityVisibility.Public}>Нээлттэй community</option>
                <option value={CommunityVisibility.Private}>Хаалттай community</option>
              </select>
              <textarea
                className="min-h-[88px] w-full rounded-xl border border-[#D0D5DD] px-4 py-3 text-[14px] outline-none"
                placeholder="Энэ community ямар багш нарт зориулагдсан бэ?"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
              <button
                type="button"
                className="w-full rounded-xl bg-[#0F172A] px-4 py-3 text-[14px] font-medium text-white disabled:opacity-60"
                onClick={() => void handleCreateCommunity()}
                disabled={isMutating || name.trim().length < 3}
              >
                {createCommunityState.loading ? "Үүсгэж байна..." : "Community үүсгэх"}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-[#DFE1E5] bg-white p-5 shadow-[0px_4px_8px_-2px_rgba(0,0,0,0.08)]">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[18px] font-semibold text-[#0F1216]">Community-үүд</h2>
              {overviewQuery.loading ? (
                <span className="text-[12px] text-[#667085]">Шинэчилж байна...</span>
              ) : null}
            </div>
            <div className="mt-4 space-y-3">
              {communities.length ? (
                communities.map((community) => (
                  <button
                    key={community.id}
                    type="button"
                    className={[
                      "w-full rounded-2xl border px-4 py-4 text-left transition",
                      selectedCommunityId === community.id
                        ? "border-[#0F172A] bg-[#F8FAFC]"
                        : "border-[#EAECF0] bg-white",
                    ].join(" ")}
                    onClick={() => setSelectedCommunityId(community.id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[15px] font-semibold text-[#0F1216]">
                          {community.name}
                        </p>
                        <p className="mt-1 text-[13px] text-[#52555B]">
                          {formatGradeLabel(community.grade)} · {community.subject}
                        </p>
                      </div>
                      <span className="rounded-full bg-[#F2F4F7] px-2.5 py-1 text-[12px] text-[#344054]">
                        {formatVisibilityLabel(community.visibility)}
                      </span>
                    </div>
                    <p className="mt-3 text-[13px] leading-5 text-[#667085]">
                      {community.description || "Тайлбаргүй community"}
                    </p>
                    <div className="mt-3 flex items-center justify-between gap-3 text-[12px] text-[#667085]">
                      <span>{community.memberCount} гишүүн</span>
                      <span>{community.sharedBankCount} share bank</span>
                    </div>
                    {!community.viewerRole ? (
                      <button
                        type="button"
                        className="mt-3 rounded-lg border border-[#D0D5DD] px-3 py-2 text-[12px] font-medium text-[#0F172A]"
                        onClick={(event) => {
                          event.stopPropagation();
                          void handleJoinCommunity(community.id);
                        }}
                        disabled={joinCommunityState.loading}
                      >
                        {joinCommunityState.loading &&
                        selectedCommunityId === community.id
                          ? "Нэгдэж байна..."
                          : "Нэгдэх"}
                      </button>
                    ) : null}
                  </button>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-[#D0D5DD] px-4 py-8 text-center text-[14px] text-[#667085]">
                  Одоогоор community алга. Эхний community-гээ үүсгээд эхэлье.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {overviewQuery.error ? (
            <div className="rounded-2xl border border-[#F1D6D5] bg-white px-6 py-8 text-[14px] text-[#B42318]">
              Community мэдээлэл ачаалахад алдаа гарлаа.
            </div>
          ) : null}

          {selectedCommunity ? (
            <>
              <div className="rounded-2xl border border-[#DFE1E5] bg-white p-6 shadow-[0px_4px_8px_-2px_rgba(0,0,0,0.08)]">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-[22px] font-semibold text-[#0F1216]">
                      {selectedCommunity.name}
                    </h2>
                    <p className="mt-2 text-[14px] leading-6 text-[#52555B]">
                      {selectedCommunity.description || "Тайлбар оруулаагүй байна."}
                    </p>
                  </div>
                  <div className="grid min-w-[220px] gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-[#F8FAFC] px-4 py-3">
                      <p className="text-[12px] text-[#667085]">Хамрах хүрээ</p>
                      <p className="mt-1 text-[14px] font-semibold text-[#0F1216]">
                        {formatGradeLabel(selectedCommunity.grade)} · {selectedCommunity.subject}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-[#F8FAFC] px-4 py-3">
                      <p className="text-[12px] text-[#667085]">Гишүүнчлэл</p>
                      <p className="mt-1 text-[14px] font-semibold text-[#0F1216]">
                        {selectedCommunity.memberCount} гишүүн
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
                <div className="space-y-6">
                  <div className="flex flex-col rounded-2xl border border-[#DFE1E5] bg-white p-6 shadow-[0px_4px_8px_-2px_rgba(0,0,0,0.08)]">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-[18px] font-semibold text-[#0F1216]">
                          My Bank-аас share хийх
                        </h3>
                        <p className="mt-1 text-[13px] text-[#667085]">
                          Эх сурвалж нь таны My Bank хэвээр үлдэнэ. Community дээр зөвхөн shared layer үүснэ.
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 max-h-[min(36rem,calc(100vh-20rem))] overflow-y-auto pr-1">
                      {!selectedCommunity.viewerRole ? (
                        <div className="rounded-2xl border border-dashed border-[#D0D5DD] px-4 py-6 text-[14px] text-[#667085]">
                          Энэ хэсгийг ашиглахын тулд community-д эхлээд нэгдэнэ үү.
                        </div>
                      ) : shareableBanks.length ? (
                        <div className="space-y-3">
                          {shareableBanks.map((bank) => (
                            <div
                              key={bank.id}
                              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#EAECF0] px-4 py-4"
                            >
                              <div>
                                <p className="text-[15px] font-semibold text-[#0F1216]">
                                  {bank.title}
                                </p>
                                <p className="mt-1 text-[13px] text-[#667085]">
                                  {formatGradeLabel(bank.grade)} · {bank.subject} · {bank.questionCount} асуулт
                                </p>
                              </div>
                              <button
                                type="button"
                                className="rounded-xl bg-[#0F172A] px-4 py-2 text-[13px] font-medium text-white disabled:opacity-60"
                                onClick={() => void handleShareBank(bank.id)}
                                disabled={shareQuestionBankState.loading}
                              >
                                {shareQuestionBankState.loading ? "Share хийж байна..." : "Share"}
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-dashed border-[#D0D5DD] px-4 py-6 text-[14px] text-[#667085]">
                          Энэ community-д share хийгээгүй My Bank одоогоор алга.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#DFE1E5] bg-white p-6 shadow-[0px_4px_8px_-2px_rgba(0,0,0,0.08)]">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-[18px] font-semibold text-[#0F1216]">
                          Shared question banks
                        </h3>
                        <p className="mt-1 text-[13px] text-[#667085]">
                          Community дээрх сангуудыг copy хийгээд өөрийн My Bank руу авч ашиглана.
                        </p>
                      </div>
                      {detailQuery.loading ? (
                        <span className="text-[12px] text-[#667085]">Ачаалж байна...</span>
                      ) : null}
                    </div>

                    <div className="mt-4 space-y-3">
                      {selectedCommunity.sharedBanks.length ? (
                        selectedCommunity.sharedBanks.map((sharedBank) => (
                          <article
                            key={sharedBank.id}
                            className="rounded-2xl border border-[#EAECF0] px-4 py-4"
                          >
                            <div className="flex flex-wrap items-start justify-between gap-4">
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="text-[15px] font-semibold text-[#0F1216]">
                                    {sharedBank.bank.title}
                                  </p>
                                  <span className="rounded-full bg-[#F2F4F7] px-2.5 py-1 text-[12px] text-[#344054]">
                                    {sharedBank.status}
                                  </span>
                                </div>
                                <p className="mt-1 text-[13px] text-[#667085]">
                                  {formatGradeLabel(sharedBank.bank.grade)} · {sharedBank.bank.subject} · {sharedBank.bank.questionCount} асуулт
                                </p>
                                <p className="mt-2 text-[13px] leading-5 text-[#52555B]">
                                  {sharedBank.bank.description || "Тайлбаргүй сан"}
                                </p>
                                <p className="mt-2 text-[12px] text-[#667085]">
                                  Share хийсэн: {sharedBank.sharedBy.fullName} · Эзэмшигч: {sharedBank.bank.owner.fullName}
                                </p>
                              </div>
                              <button
                                type="button"
                                className="rounded-xl border border-[#D0D5DD] px-4 py-2 text-[13px] font-medium text-[#0F172A] disabled:opacity-60"
                                onClick={() => void handleCopySharedBank(sharedBank.id)}
                                disabled={copySharedBankState.loading}
                              >
                                {copySharedBankState.loading ? "Copy хийж байна..." : "My Bank руу copy"}
                              </button>
                            </div>
                          </article>
                        ))
                      ) : (
                        <div className="rounded-2xl border border-dashed border-[#D0D5DD] px-4 py-8 text-center text-[14px] text-[#667085]">
                          Энэ community-д одоогоор share хийгдсэн question bank алга.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#DFE1E5] bg-white p-6 shadow-[0px_4px_8px_-2px_rgba(0,0,0,0.08)]">
                  <h3 className="text-[18px] font-semibold text-[#0F1216]">Гишүүд</h3>
                  <p className="mt-1 text-[13px] text-[#667085]">
                    Subject-level community үүсгэх суурь гишүүд.
                  </p>
                  <div className="mt-4 space-y-3">
                    {selectedCommunity.members.map((member) => (
                      <div
                        key={member.id}
                        className="rounded-2xl border border-[#EAECF0] px-4 py-3"
                      >
                        <p className="text-[14px] font-semibold text-[#0F1216]">
                          {member.user.fullName}
                        </p>
                        <p className="mt-1 text-[12px] text-[#667085]">{member.role}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#D0D5DD] bg-white px-6 py-12 text-center text-[14px] text-[#667085] shadow-[0px_4px_8px_-2px_rgba(0,0,0,0.08)]">
              Community сонгох эсвэл шинээр үүсгэж эхэлнэ үү.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
