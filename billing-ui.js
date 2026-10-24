// Lightweight billing UI shared by the Prompt workshop and style mixer.
(function initStyleAtlasBilling() {
  function start() {
    if (!window.StyleAtlasImage || !document.querySelector("#generateImageButton, #generateMixerImageButton")) return;

    const anchor = document.querySelector(".image-model-control") || document.querySelector(".output-actions");
    const summary = document.createElement("div");
    summary.className = "billing-summary";
    summary.innerHTML = '<span>可用额度 <strong data-billing-balance>加载中…</strong></span><button type="button" class="text-button" data-billing-open>购买额度</button>';
    anchor?.before(summary);

    const dialog = document.createElement("dialog");
    dialog.className = "billing-dialog";
    dialog.innerHTML = `
      <div class="billing-dialog-heading">
        <div><p class="eyebrow">STYLE ATLAS CREDITS</p><h2>购买生图额度</h2></div>
        <button type="button" class="icon-button" data-billing-close aria-label="关闭购买窗口">×</button>
      </div>
      <p class="billing-dialog-copy">支付完成并收到回调后，额度会自动到账。每个额度约等于 0.01 美元的模型成本。</p>
      <div class="billing-fields">
        <label>支付地区<select data-billing-region><option value="global">海外 · Stripe</option><option value="cn">中国大陆 · 微信 / 支付宝</option></select></label>
        <label data-billing-channel-label>支付方式<select data-billing-channel><option value="wx_pub_qr">微信支付</option><option value="alipay_qr">支付宝</option></select></label>
      </div>
      <div class="billing-plans" data-billing-plans><span>正在加载额度包…</span></div>
      <p class="billing-dialog-status" data-billing-status role="status"></p>`;
    document.body.append(dialog);

    const balanceNode = summary.querySelector("[data-billing-balance]");
    const plansNode = dialog.querySelector("[data-billing-plans]");
    const statusNode = dialog.querySelector("[data-billing-status]");
    const regionNode = dialog.querySelector("[data-billing-region]");
    const channelLabel = dialog.querySelector("[data-billing-channel-label]");
    let plans = [];
    let availability = {};

    function formatPrice(plan, region) {
      return region === "cn" ? `¥${(plan.prices.CNY / 100).toFixed(2)}` : `$${(plan.prices.USD / 100).toFixed(2)}`;
    }

    function renderPlans() {
      const region = regionNode.value;
      const provider = region === "cn" ? "pingxx" : "stripe";
      channelLabel.hidden = region !== "cn";
      plansNode.innerHTML = plans.map((plan) => `<button type="button" class="billing-plan" data-plan-id="${escapeHtml(plan.id)}" ${availability[provider] === false ? "disabled" : ""}>
        <strong>${escapeHtml(plan.label)}</strong><span>${escapeHtml(plan.description)}</span><b>${formatPrice(plan, region)}</b><small>${plan.credits} 额度</small>
      </button>`).join("") || "<span>暂时没有可购买的额度包</span>";
      if (availability[provider] === false) statusNode.textContent = region === "cn" ? "大陆支付通道尚未配置，请联系站点管理员" : "海外支付通道尚未配置，请联系站点管理员";
      else statusNode.textContent = "";
    }

    async function refresh() {
      try {
        const [accountPayload, planPayload] = await Promise.all([
          window.StyleAtlasImage.getAccount(),
          window.StyleAtlasImage.getBillingPlans()
        ]);
        balanceNode.textContent = `${accountPayload.account?.credits ?? 0} 额度`;
        plans = Array.isArray(planPayload.plans) ? planPayload.plans : [];
        availability = planPayload.providerAvailability || {};
        renderPlans();
      } catch (error) {
        balanceNode.textContent = "暂不可用";
        statusNode.textContent = error.message || "支付账户服务暂时不可用";
      }
    }

    function open() {
      if (!dialog.open) dialog.showModal();
      refresh();
    }

    summary.querySelector("[data-billing-open]").addEventListener("click", open);
    dialog.querySelector("[data-billing-close]").addEventListener("click", () => dialog.close());
    regionNode.addEventListener("change", renderPlans);
    plansNode.addEventListener("click", async (event) => {
      const button = event.target.closest("[data-plan-id]");
      if (!button || button.disabled) return;
      button.disabled = true;
      statusNode.textContent = "正在创建支付订单…";
      try {
        const result = await window.StyleAtlasImage.createCheckout({
          planId: button.dataset.planId,
          region: regionNode.value,
          channel: dialog.querySelector("[data-billing-channel]").value,
          returnUrl: window.location.href
        });
        if (result.checkoutUrl) {
          window.location.assign(result.checkoutUrl);
          return;
        }
        statusNode.textContent = "订单已创建，请在支付页面完成付款；支付成功后刷新本页即可到账。";
        if (result.credential) {
          const details = document.createElement("pre");
          details.className = "billing-credential";
          details.textContent = JSON.stringify(result.credential, null, 2);
          statusNode.replaceChildren(statusNode.firstChild || document.createTextNode(""), details);
        }
      } catch (error) {
        statusNode.textContent = error.message || "暂时无法创建支付订单";
      } finally {
        button.disabled = false;
      }
    });

    window.StyleAtlasBilling = Object.freeze({ open, refresh });
    refresh();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();

  function escapeHtml(value) {
    return String(value).replace(/[&<>\"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" })[character]);
  }
})();
